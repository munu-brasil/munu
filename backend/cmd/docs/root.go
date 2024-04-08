package docs

import (
	"github.com/spf13/cobra"
)

func RegisterCommandRecursive(parent *cobra.Command) {
	parent.AddCommand(GenerateOpenAPI3())
}
