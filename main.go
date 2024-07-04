package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	extism "github.com/extism/go-sdk"
)

// TODO this is wonk
// CopyFile copies a file from src to dst. If the dst file already exists, it will be overwritten.
func CopyFile(src, dst string) error {
	// Open the source file for reading
	sourceFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("could not open source file: %v", err)
	}
	defer sourceFile.Close()

	// Create the destination file
	destFile, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("could not create destination file: %v", err)
	}
	defer destFile.Close()

	// Copy the contents from source to destination
	_, err = io.Copy(destFile, sourceFile)
	if err != nil {
		return fmt.Errorf("error copying contents: %v", err)
	}

	// Sync to ensure all contents are written to disk
	err = destFile.Sync()
	if err != nil {
		return fmt.Errorf("error syncing destination file: %v", err)
	}

	return nil
}

func main() {
	schemaCtx := `
  {
    "project": {"name": "hello", "description": "a new plugin that does something", "appId": "app_1234", "extensionPointId": "ext_1234" },
    "schema": {
    "exports": [
      {
        "name": "voidFunc",
        "description": "This demonstrates how you can create an export with\nno inputs or outputs.\n",
        "input": { "name": "" },
        "output": { "name": "" }
      },
      {
        "name": "primitiveTypeFunc",
        "input": {
          "type": "string",
          "contentType": "text/plain; charset=UTF-8",
          "description": "A string passed into plugin input"
        },
        "output": {
          "type": "boolean",
          "contentType": "application/json",
          "description": "A boolean encoded as json"
        },
        "codeSamples": [
          {
            "lang": "typescript",
            "label": "Test if a string has more than one character.\nCode samples show up in documentation and inline in docstrings\n",
            "source": "function primitiveTpeFunc(input: string): boolean {\n  return input.length > 1\n}\n"
          }
        ],
        "description": "This demonstrates how you can accept or return primtive types.\nThis function takes a utf8 string and returns a json encoded boolean\n"
      },
      {
        "name": "referenceTypeFunc",
        "input": {
          "$ref": "#/schemas/Fruit"
        },
        "output": {
          "$ref": "#/schemas/ComplexObject"
        },
        "description": "This demonstrates how you can accept or return references to schema types.\nAnd it shows how you can define an enum to be used as a property or input/output.\n"
      }
    ],
    "imports": [
      {
        "name": "eatAFruit",
        "input": {
          "$ref": "#/schemas/Fruit"
        },
        "output": {
          "type": "boolean",
          "contentType": "application/json",
          "description": "boolean encoded as json"
        },
        "description": "This is a host function. Right now host functions can only be the type (i64) -> i64.\nWe will support more in the future. Much of the same rules as exports apply.\n"
      }
    ],
    "schemas": [
      {
        "enum": [
          "apple",
          "orange",
          "banana",
          "strawberry"
        ],
        "name": "Fruit",
        "description": "A set of available fruits you can consume"
      },
      {
        "enum": [
          "blinky",
          "pinky",
          "inky",
          "clyde"
        ],
        "name": "GhostGang",
        "description": "A set of all the enemies of pac-man"
      },
      {
        "name": "ComplexObject",
        "required": [
          "ghost",
          "aBoolean",
          "aString",
          "anInt"
        ],
        "properties": [
          {
            "$ref": "#/schemas/GhostGang",
            "name": "ghost",
            "description": "I can override the description for the property here"
          },
          {
            "name": "aBoolean",
            "type": "boolean",
            "description": "A boolean prop"
          },
          {
            "name": "aString",
            "type": "integer",
            "format": "int32",
            "description": "An int prop"
          },
          {
            "name": "anInt",
            "type": "integer",
            "format": "int32",
            "description": "An int prop"
          },
          {
            "name": "anOptionalDate",
            "type": "string",
            "format": "date-time",
            "description": "A datetime object, we will automatically serialize and deserialize\nthis for you.\n"
          }
        ],
        "contentType": "application/json",
        "description": "A complex json object"
      }
    ],
    "version": "v1-draft"
    }
  }
  `

	manifest := extism.Manifest{
		Wasm: []extism.Wasm{
			extism.WasmFile{
				Path: "./dist/plugin.wasm",
			},
		},
		Config: map[string]string{
			"ctx": schemaCtx,
		},
	}

	ctx := context.Background()
	config := extism.PluginConfig{EnableWasi: true}
	plugin, err := extism.NewPlugin(ctx, manifest, config, []extism.HostFunction{})

	if err != nil {
		fmt.Printf("Failed to initialize plugin: %v\n", err)
		os.Exit(1)
	}

	root := "template"
	output := "output"

	// TODO this is kind of dangerous
	os.RemoveAll(output)
	os.Mkdir(output, os.ModePerm)

	err = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// skip root path
		if path == root {
			return nil
		}

		mirrorPath := strings.Replace(path, root, output, 1)

		name := info.Name()
		if info.IsDir() {
			fmt.Println("+ Creating directory " + mirrorPath)
			os.Mkdir(mirrorPath, os.ModePerm)
		} else {
			if strings.HasSuffix(strings.ToLower(name), ".ejs") {
				sourceFile, err := os.Open(path)
				if err != nil {
					return fmt.Errorf("could not open source file: %v", err)
				}
				defer sourceFile.Close()

				data, err := io.ReadAll(sourceFile)
				if err != nil {
					panic(err)
				}

				exit, result, err := plugin.Call("render", data)
				if err != nil {
					fmt.Println(err)
					os.Exit(int(exit))
				}

				// TODO this won't work with casing and could replace the wrong thing first
				mirrorPath = strings.Replace(mirrorPath, ".ejs", "", 1)

				err = os.WriteFile(mirrorPath, result, os.ModePerm)
				if err != nil {
					panic(err)
				}
				fmt.Println("! Rendered template to " + mirrorPath)
			} else {
				fmt.Println("- Copy file to " + mirrorPath)
				CopyFile(path, mirrorPath)
			}
		}

		return nil
	})

	if err != nil {
		log.Fatalf("Error walking the path %q: %v\n", root, err)
	}
}
