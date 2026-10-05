import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class VerifyingProgressDialog extends StatefulWidget {
  final String queryValue;
  final String queryType;
  final VoidCallback onFinished;

  const VerifyingProgressDialog({
    super.key,
    required this.queryValue,
    required this.queryType,
    required this.onFinished,
  });

  @override
  State<VerifyingProgressDialog> createState() => _VerifyingProgressDialogState();
}

class _VerifyingProgressDialogState extends State<VerifyingProgressDialog> {
  int _currentStep = 0;

  final List<Map<String, String>> _steps = [
    {
      'am': 'የጎንደር ከተማ ማዕከላዊ ዳታቤዝ መፈለግ...',
      'en': 'Searching Gondar Central Registry...',
    },
    {
      'am': 'የመንገድ ፈቃድ እና ሁኔታ ማረጋገጥ...',
      'en': 'Validating City Transport Permit...',
    },
    {
      'am': 'የሰሌዳ እና ቻሲስ ቁጥር ማመሳከር...',
      'en': 'Matching Chassis & Plate Number...',
    },
  ];

  @override
  void initState() {
    super.initState();
    _startAnimation();
  }

  void _startAnimation() async {
    await Future.delayed(const Duration(milliseconds: 400));
    if (mounted) setState(() => _currentStep = 1);
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) setState(() => _currentStep = 2);
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      widget.onFinished();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Radar Icon
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 76,
                  height: 76,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: const Color(0xFF0C355B),
                    backgroundColor: Colors.blue.shade100,
                  ),
                ),
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0C355B),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blue.withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(LucideIcons.scanLine, color: Colors.amber, size: 28),
                ),
              ],
            ),
            const SizedBox(height: 20),

            const Text(
              'ተሽከርካሪ በመፈተሽ ላይ...',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0C355B),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Query: ${widget.queryValue}',
              style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 20),

            // Steps
            Column(
              children: List.generate(_steps.length, (index) {
                final isDone = index < _currentStep;
                final isCurrent = index == _currentStep;

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6.0),
                  child: Row(
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDone
                              ? Colors.green
                              : isCurrent
                                  ? const Color(0xFF0C355B)
                                  : Colors.grey.shade300,
                        ),
                        child: Center(
                          child: isDone
                              ? const Icon(LucideIcons.check, size: 14, color: Colors.white)
                              : isCurrent
                                  ? const SizedBox(
                                      width: 10,
                                      height: 10,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : Text(
                                      '${index + 1}',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _steps[index]['am']!,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                                color: isCurrent ? const Color(0xFF0C355B) : Colors.black87,
                              ),
                            ),
                            Text(
                              _steps[index]['en']!,
                              style: TextStyle(
                                fontSize: 9,
                                color: isCurrent ? Colors.blue.shade700 : Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
