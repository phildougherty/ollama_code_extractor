def factorial(n):
    """Calculate the factorial of a non-negative integer n."""
    if not isinstance(n, int) or n < 0:
        raise ValueError("Factorial is only defined for non-negative integers.")
    if n == 0 or n == 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# Example usage:
if __name__ == "__main__":
    try:
        num = int(input("Enter a non-negative integer: "))
        print(f"{num}! = {factorial(num)}")
    except ValueError as e:
        print(e)