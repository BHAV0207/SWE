# Class 4 – Introduction to Shell Scripting

## 1. Basic Linux Commands

### Create Directory
```bash
mkdir test
````

Creates a new folder named `test`.

### Change Directory

```bash
cd test/
```

Moves into the `test` directory.

### Create and Write to File

```bash
echo "Learning in scaler" > scaler.txt
```

* Prints text to the terminal
* Redirects output to `scaler.txt`
* Creates the file if it does not exist
* Overwrites the file if it already exists

### Move to Parent Directory

```bash
cd ..
```

Moves one level up from the current directory.

### List Files

```bash
ls -a
```

Lists all files, including hidden files (starting with `.`).

## 2. Deleting Directories

### Remove Empty Directory

```bash
rmdir test
```

Fails if the directory is not empty.
Error:

```
rmdir: failed to remove 'test': Directory not empty
```

### Force Delete Directory with Contents

```bash
rm -rf test
```

Flags:

* `-r`: Recursive delete
* `-f`: Force delete without confirmation

Deletes the directory and all files inside it.

## 3. Redirection Operators

| Operator | Meaning              | Effect on Existing File |
| -------- | -------------------- | ----------------------- |
| `>`      | Redirect + Overwrite | Deletes old content     |
| `>>`     | Redirect + Append    | Preserves old content   |

## 4. Find Command

### Find Files by Name

```bash
find . -name "*.txt"
```

* Searches current directory and subdirectories
* Finds files ending with `.txt`

### Find Large Files

```bash
find . -type f -size +50M
```

* `-type f`: Only files
* `-size +50M`: Files larger than 50 MB

## 5. File Permissions (chmod)

### Permission Values

| Permission | Symbol | Value |
| ---------- | ------ | ----- |
| Read       | r      | 4     |
| Write      | w      | 2     |
| Execute    | x      | 1     |

### Common chmod Commands

| Command             | Use Case              | Owner | Group | Others |
| ------------------- | --------------------- | ----- | ----- | ------ |
| `chmod 777 file`    | Full access (unsafe)  | rwx   | rwx   | rwx    |
| `chmod 755 file`    | Scripts               | rwx   | r-x   | r-x    |
| `chmod 700 file`    | Private files         | rwx   | ---   | ---    |
| `chmod 644 file`    | Documents / web files | rw-   | r--   | r--    |
| `chmod 600 key.pem` | SSH private key       | rw-   | ---   | ---    |

### Symbolic chmod

```bash
chmod u+x file
chmod g-w file
chmod o+r file
chmod a+x script.sh
chmod u=rwx,g=rx,o=r file
```

## 6. VI Editor Commands

### Modes

* Insert mode: `i`
* Command mode: `Esc`

### File Operations

* Save and quit: `:wq`
* Quit without saving: `:q!`

### Editing

* Delete line: `dd`
* Undo: `u`
* Copy line: `yy`
* Paste: `p`

### Navigation

* Search: `/word`
* First line: `gg` or `1G`
* Last line: `G`
* Go to line N: `:N`
* Line start: `0`
* Line end: `$`

## 7. Shell Script Execution Example

### Create File

```bash
vi helloworld.txt
```

### Try Executing Without Permission

```bash
./helloworld.txt
```

Error:

```
permission denied
```

### Check Permissions

```bash
ls -lt
```

Shows file permissions.

### Run Using Shell

```bash
sh helloworld.txt
```

Script executes successfully.

### Change Permissions

```bash
chmod 700 helloworld.txt
```

### Execute Script

```bash
./helloworld.txt
```

Script runs successfully after permission update.