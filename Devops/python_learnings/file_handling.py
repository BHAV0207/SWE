f = open('package/data.txt', 'r+')
# the above is to open the file in read mode
# other modes are 'w' for write , 'a' for append , 'r+' for read and write

content = f.read()
# there are other methods like readline() and readlines() to read the file line by line

print(content)

# always close the file after operations to free up resources

f.write("\nThis line is added using python file handling.")
f.close()