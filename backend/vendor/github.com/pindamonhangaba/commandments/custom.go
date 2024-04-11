package commandments

import (
	"reflect"
	"strings"

	"github.com/mitchellh/mapstructure"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

type CMDDefaults struct {
	ShortDescription      string
	Description           string
	DefaultConfigFilename string
	EnvPrefix             string
}

type cmdArg[T any] struct {
	shortDescription      string
	description           string
	defaultConfigFilename string
	envPrefix             string
	withConfig            *func(T) error
	withCMD               *func(*cobra.Command, T)
	defaultConfigValue    *T
}

func WithConfig[T any](f func(T) error) cmdArg[T] {
	return cmdArg[T]{
		withConfig: &f,
	}
}

func WithDefaultConfig[T any](config T) cmdArg[T] {
	return cmdArg[T]{
		defaultConfigValue: &config,
	}
}

func WithDefaults[T any](d CMDDefaults) cmdArg[T] {
	return cmdArg[T]{
		shortDescription:      d.ShortDescription,
		description:           d.Description,
		defaultConfigFilename: d.DefaultConfigFilename,
		envPrefix:             d.EnvPrefix,
	}
}

func MustCMD[T any](name string, configs ...cmdArg[T]) *cobra.Command {
	cmd, err := NewCMD(name, configs...)
	if err != nil {
		panic(err)
	}
	return cmd
}

func NewCMD[T any](name string, configs ...cmdArg[T]) (*cobra.Command, error) {
	cmd := &cobra.Command{
		Use: name,
	}

	sflags, err := structToFlags[T]()
	if err != nil {
		return nil, err
	}

	var configValue *T = new(T)
	defaultConfigFilename := "config"
	envPrefix := "app"
	for _, config := range configs {
		if len(config.description) > 0 {
			cmd.Long = config.description
		}
		if len(config.description) > 0 {
			cmd.Short = config.shortDescription
		}
		if config.defaultConfigValue != nil {
			configValue = config.defaultConfigValue
		}
		if len(config.defaultConfigFilename) > 0 {
			defaultConfigFilename = config.defaultConfigFilename
		}
		if len(config.envPrefix) > 0 {
			envPrefix = config.envPrefix
		}

	}

	for _, config := range configs {
		if config.withConfig != nil {
			withConfig := *config.withConfig

			cmd.RunE = func(cmd *cobra.Command, args []string) error {

				v, ok := cmd.Context().Value(ViperContext).(*viper.Viper)
				if ok {
					err := v.Unmarshal(configValue, func(opt *mapstructure.DecoderConfig) {
						opt.TagName = "flag"
					})
					if err != nil {
						return errors.Wrap(err, "viper config")
					}
				}
				return withConfig(*(configValue))
			}
			cmd.PersistentPreRunE = func(c *cobra.Command, args []string) error {
				return initializeConfig(c, envPrefix, defaultConfigFilename)
			}
		}
	}

	for _, flag := range sflags {
		defVal, err := structValueFromField(*configValue, flag.field)
		if err != nil {
			return nil, errors.Wrap(err, "get default value")
		}
		switch flag.kind {
		case reflect.Bool:
			d := false
			if val, ok := defVal.(bool); ok {
				d = val
			}
			cmd.PersistentFlags().Bool(flag.name, d, flag.usage)
		case reflect.String:
			d := ""
			if val, ok := defVal.(string); ok {
				d = val
			}
			cmd.PersistentFlags().String(flag.name, d, flag.usage)
		case reflect.Int:
			d := 0
			if val, ok := defVal.(int); ok {
				d = val
			}
			cmd.PersistentFlags().Int(flag.name, d, flag.usage)
		default:
			d := ""
			if val, ok := defVal.(string); ok {
				d = val
			}
			cmd.PersistentFlags().String(flag.name, d, flag.usage)
		}
	}

	return cmd, nil
}

type flag struct {
	field, name, usage string
	kind               reflect.Kind
}

func structToFlags[T any]() ([]flag, error) {
	flags := []flag{}
	var o T
	rt := reflect.TypeOf(o)
	if rt.Kind() != reflect.Struct {
		return nil, errors.Errorf("only struct allowed, received %s", rt.Kind())
	}
	for i := 0; i < rt.NumField(); i++ {
		f := rt.Field(i)
		hasFlagTag := len(f.Tag.Get("flag")) > 0
		t := strings.Split(f.Tag.Get("flag"), ",")
		v := f.Name
		u := ""
		if hasFlagTag && len(t) > 1 {
			u = t[1]
		}
		if hasFlagTag && len(t) > 0 {
			v = t[0]
		}
		flags = append(flags, flag{
			name:  v,
			usage: u,
			kind:  f.Type.Kind(),
			field: f.Name,
		})
	}
	return flags, nil
}

func structValueFromField[T any](s T, field string) (any, error) {
	rt := reflect.ValueOf(s)
	if rt.Kind() != reflect.Struct {
		return nil, errors.Errorf("only struct allowed, received %s", rt.Kind())
	}
	f := rt.FieldByName(field)
	return f.Interface(), nil
}
