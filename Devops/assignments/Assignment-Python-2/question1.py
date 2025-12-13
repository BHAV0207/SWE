def gradeChecker(marks):
    if marks < 0 or marks > 100:
        return "Invalid marks"
    elif marks > 90:
        return "A"
    elif marks > 80:
        return "B"
    elif marks > 70:
        return "C"
    elif marks > 60:
        return "D"  
    else:
        return "F"

ans = gradeChecker(int(input("Enter your marks: ")))


print(f"Your grade is: {ans}")