gradeSheet = {
    "bhavya": "A",
    "dipti": "A+",
    "shivani": "D",
    "ishupriya": "F",
    "ansh": "B",
    "ruchir": "C",
}

def addNewStudent(name , grade):
  gradeSheet[name] = grade
  return gradeSheet

def updateGrade(name , grade):
  if name in gradeSheet:
    gradeSheet[name] = grade
    return gradeSheet
  else:
    return "Student not found"
  
def printAllGrades():
  for i in gradeSheet:
    print({i: gradeSheet[i]})
    
    
a = input ("Enter 1 to add new student , 2 to update grade , 3 to print all grades: ")
if a == '1' : 
  name = input("Enter student name: ")
  grade = input("Enter student grade: ")
  print(addNewStudent(name , grade))
elif a == '2' :
  name = input("Enter student name: ")
  grade = input("Enter new grade: ")
  print(updateGrade(name , grade))
elif a == '3' :
  printAllGrades()
else:
  print("Invalid input")

