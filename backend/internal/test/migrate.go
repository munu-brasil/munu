package test

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/pkg/errors"
)

type Migrate struct {
	MigrationFilesGlobPath string
	DB                     *sql.DB
}

func (mig *Migrate) Run() (int, error) {
	return mig.migrateDB()
}

// migrateDB finds the last run migration, and run all those after it in order
// We use the migration table to do this
func (mig *Migrate) migrateDB() (int, error) {
	var completed []string

	// Get a list of migration files
	files, err := filepath.Glob(mig.MigrationFilesGlobPath)
	if err != nil {
		log.Printf("Error running restore %s", err)
		return 0, err
	}

	// Sort the list alphabetically
	sort.Strings(files)

	migrations := mig.readMetadata()

	for _, file := range files {
		filename := filepath.Base(file)

		if !contains(filename, migrations) {
			log.Printf("Running migration %s", filename)

			err := mig.execMigration(file)
			if err != nil {
				// If at any point we fail, log it and break
				log.Printf("ERROR loading sql migration:%s\n", err)
				log.Printf("All further migrations cancelled\n\n")
				return len(completed), err
			}

			completed = append(completed, filename)
			log.Printf("Completed migration %s\n", filename)
		}
	}

	if len(completed) > 0 {
		log.Printf("Migrations complete up to migration %s \n\n", completed[len(completed)-1])
	} else {
		log.Printf("No migrations to perform \n\n")
	}
	return len(completed), nil
}

// execMigration executes the migration file
func (mig *Migrate) execMigration(filePath string) error {
	filename := filepath.Base(filePath)
	contents, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}

	tx, err := mig.DB.Begin()
	if err != nil {
		return err
	}

	err = func() error {
		_, err := tx.Exec(string(contents))
		if err != nil {
			return errors.Wrap(err, filename)
		}

		sql := "insert into migration (migr_id) values($1)"
		res, err := tx.Exec(sql, filename)
		if err != nil {
			return err
		}
		affected, err := res.RowsAffected()
		if err != nil {
			return err
		}
		if affected == 0 {
			return errors.New("registering migration")
		}
		return nil
	}()
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Commit()

	return err
}

// readMetadata reads the metadata from the migration table
func (mig *Migrate) readMetadata() []string {
	var migrations []string

	sql := "select migr_id from migration order by migr_id desc;"

	rows, err := mig.DB.Query(sql)
	if err != nil {
		if strings.Contains(err.Error(), `relation "migration" does not exist`) {
			return migrations
		}
		log.Printf("Database ERROR %s", err)
		return migrations
	}

	// We expect just one row, with one column (count)
	defer rows.Close()
	for rows.Next() {
		var migration string
		err := rows.Scan(&migration)
		if err != nil {
			log.Printf("Database ERROR %s", err)
			return migrations
		}
		migrations = append(migrations, migration)
	}

	return migrations
}

// contains checks whether an array of strings contains a string
func contains(s string, a []string) bool {
	for _, k := range a {
		if s == k {
			return true
		}
	}
	return false
}
