import re

with open('src/services/ReportGenerator.ts', 'r') as f:
    content = f.read()

# Change calculatePay to calculatePayFromMinutes
# Original code:
#       const { totalPay: pay, overtimeHours: otHours } = calculatePay(
#         hours,
#         settings.hourly_rate,
#         settings.overtime_multiplier
#       );
# Change to:
#       const { totalPay: pay, regularMinutes, overtimeMinutes } = calculatePayFromMinutes(
#         Math.round(durationMs / 60000),
#         settings.hourly_rate,
#         settings.overtime_multiplier
#       );
#       const otHours = overtimeMinutes / 60;

pattern = r'const \{ totalPay: pay, overtimeHours: otHours \} = calculatePay\(\s+hours,\s+settings\.hourly_rate,\s+settings\.overtime_multiplier\s+\);'
replacement = """const { totalPay: pay, regularMinutes, overtimeMinutes } = calculatePayFromMinutes(
        Math.round(durationMs / 60000),
        settings.hourly_rate,
        settings.overtime_multiplier
      );
      const otHours = overtimeMinutes / 60;"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Update imports
content = content.replace('calculatePay,', 'calculatePayFromMinutes,')

with open('src/services/ReportGenerator.ts', 'w') as f:
    f.write(content)
