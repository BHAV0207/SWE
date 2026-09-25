import unittest

from calc_server.arithmetic import CalculationError, InvalidOperand, calculate, format_number, parse_number


class ParseNumberTest(unittest.TestCase):
    def test_accepts_integers_and_decimals(self):
        self.assertEqual(parse_number("42"), 42)
        self.assertEqual(parse_number("-7"), -7)
        self.assertEqual(parse_number("2.5"), 2.5)
        self.assertEqual(parse_number("1e3"), 1000.0)

    def test_rejects_non_numbers(self):
        for text in ["x", "", " 1", "1_000", "nan", "inf", "0x10", "1e999", "9" * 65]:
            with self.subTest(text=text), self.assertRaises(InvalidOperand):
                parse_number(text)


class CalculateTest(unittest.TestCase):
    def test_assignment_examples(self):
        self.assertEqual(calculate("add", 2, 3), 5)
        self.assertEqual(calculate("sub", 10, 4), 6)
        self.assertEqual(calculate("mul", 6, 7), 42)
        self.assertEqual(calculate("div", 9, 3), 3)

    def test_division_by_zero(self):
        with self.assertRaises(CalculationError):
            calculate("div", 1, 0)

    def test_float_overflow_is_an_error(self):
        with self.assertRaises(CalculationError):
            calculate("mul", 1e308, 10.0)


class FormatNumberTest(unittest.TestCase):
    def test_integral_results_print_without_decimal_point(self):
        self.assertEqual(format_number(3), "3")
        self.assertEqual(format_number(3.0), "3")

    def test_fractions(self):
        self.assertEqual(format_number(calculate("div", 1, 4)), "0.25")


if __name__ == "__main__":
    unittest.main()
