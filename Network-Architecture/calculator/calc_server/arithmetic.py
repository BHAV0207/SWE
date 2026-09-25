"""The calculator itself. Knows nothing about HTTP."""

from __future__ import annotations

import math
import operator
import re
from typing import Callable, Dict, Union

Number = Union[int, float]

# Deliberately stricter than float(): no whitespace, no "1_000", no "nan"/"inf".
_NUMBER = re.compile(r"^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$")
_INTEGER = re.compile(r"^[+-]?\d+$")

# Bounds the work one request can cause (Python's big ints are unbounded).
MAX_OPERAND_LENGTH = 64


class InvalidOperand(ValueError):
    pass


class CalculationError(ArithmeticError):
    pass


def parse_number(text: str) -> Number:
    if len(text) > MAX_OPERAND_LENGTH or not _NUMBER.match(text):
        raise InvalidOperand(f"not a number: {text!r}")
    value: Number = int(text) if _INTEGER.match(text) else float(text)
    if not math.isfinite(value):
        raise InvalidOperand(f"number out of range: {text!r}")
    return value


def divide(a: Number, b: Number) -> Number:
    if b == 0:
        raise CalculationError("division by zero")
    if isinstance(a, int) and isinstance(b, int) and a % b == 0:
        return a // b
    return a / b


OPERATIONS: Dict[str, Callable[[Number, Number], Number]] = {
    "add": operator.add,
    "sub": operator.sub,
    "mul": operator.mul,
    "div": divide,
}


def calculate(operation: str, a: Number, b: Number) -> Number:
    result = OPERATIONS[operation](a, b)
    if isinstance(result, float) and not math.isfinite(result):
        raise CalculationError("result out of range")
    return result


def format_number(value: Number) -> str:
    """9/3 prints as '3', not '3.0'; 1/4 prints as '0.25'."""
    if isinstance(value, float) and value.is_integer() and abs(value) < 1e15:
        return str(int(value))
    return str(value)
