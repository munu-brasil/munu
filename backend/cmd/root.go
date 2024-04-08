package cmd

import (
	"log"
	"os"

	"github.com/munu-brasil/munu/backend/cmd/docs"
	"github.com/munu-brasil/munu/backend/cmd/serve"

	"github.com/spf13/cobra"
)

// RootCmd represents the base command when called without any subcommands
func NewRootCmd() (cmd *cobra.Command) {
	cmd = &cobra.Command{
		Use: "munu",
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			// You can bind cobra and viper in a few locations, but PersistencePreRunE on the root command works well
			//return initializeConfig(cmd)
			return nil
		},
	}
	cmd.PersistentFlags().String("config", "", "Path for config file")

	serve.RegisterCommandRecursive(cmd)
	docs.RegisterCommandRecursive(cmd)

	return cmd
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the RootCmd.
func Execute() {
	c := NewRootCmd()

	if err := c.Execute(); err != nil {
		log.Println(err)
		os.Exit(1)
	}
}
