package commandments

import (
	"context"
	"fmt"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

type viperContext string

const ViperContext = viperContext("commandments")

// initializeConfig initializes a viper config
// defaultConfigFilename: The name of our config file, without the file extension because viper supports many different config file languages.
// envPrefix: The environment variable prefix of all environment variables bound to our command line flags.
// For example, envPrefix as "APP", --number is bound to APP_NUMBER.
func initializeConfig(cmd *cobra.Command, envPrefix, defaultConfigFilename string) error {
	v := viper.New()

	// Set the base name of the config file, without the file extension.
	v.SetConfigName(defaultConfigFilename)

	// Set as many paths as you like where viper should look for the
	// config file. We are only looking in the current working directory.
	v.AddConfigPath(".")

	configPath, err := cmd.Flags().GetString("config")
	if err != nil {
		return err
	}
	if len(configPath) > 0 {
		v.SetConfigFile(configPath)
	}

	// Attempt to read the config file, gracefully ignoring errors
	// caused by a config file not being found. Return an error
	// if we cannot parse the config file.
	if err := v.ReadInConfig(); err != nil {
		// It's okay if there isn't a config file
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return err
		}
	}

	// When we bind flags to environment variables expect that the
	// environment variables are prefixed, e.g. a flag like --number
	// binds to an environment variable STING_NUMBER. This helps
	// avoid conflicts.
	v.SetEnvPrefix(envPrefix)

	// Bind to environment variables
	// Works great for simple config names, but needs help for names
	// like --favorite-color which we fix in the bindFlags function
	v.AutomaticEnv()

	// Bind the current command's flags to viper
	err = bindFlags(cmd, v, envPrefix)
	if err != nil {
		return err
	}
	cmd.SetContext(context.WithValue(cmd.Context(), ViperContext, v))
	return nil
}

// Bind each cobra flag to its associated viper configuration (config file and environment variable)
func bindFlags(cmd *cobra.Command, v *viper.Viper, envPrefix string) (err error) {
	cmd.Flags().VisitAll(func(f *pflag.Flag) {
		// Environment variables can't have dashes in them, so bind them to their equivalent
		// keys with underscores, e.g. --favorite-color to STING_FAVORITE_COLOR
		if strings.Contains(f.Name, "-") {
			envVarSuffix := strings.ToUpper(strings.ReplaceAll(f.Name, "-", "_"))
			v.BindEnv(f.Name, fmt.Sprintf("%s_%s", envPrefix, envVarSuffix))
		}

		// bind flags to viper so that flags override config file
		err = v.BindPFlag(f.Name, cmd.Flags().Lookup(f.Name))

		// Apply the viper config value to the flag when the flag is not set and viper has a value
		if !f.Changed && v.IsSet(f.Name) {
			val := v.Get(f.Name)
			cmd.Flags().Set(f.Name, fmt.Sprintf("%v", val))
		}
	})
	return err
}
