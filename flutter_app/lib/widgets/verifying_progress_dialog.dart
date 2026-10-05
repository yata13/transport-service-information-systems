import 'package:flutter/material.dart';

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
      'am': '1. የጎንደር ማዕከላዊ መዝገብ መፈለግ...',
      'en': 'Querying Gondar central transport registry...',
    },
    {
      'am': '2. የፈቃድ ቁጥር እና ሰነዶች መመርመር...',
      'en': 'Checking permit and registration validity...',
    },
    {
      'am': '3. የሰሌዳ እና የቻሲስ መረጃ ማመሳከር...',
      'en': 'Cross-matching plate, VIN & driver records...',
    },
  ];

  @override
  void initState() {
    super.initState();
    _startAnimation();
  }

  void _startAnimation() async {
    await Future.delayed(const Duration(milliseconds: 350));
    if (mounted) setState(() => _currentStep = 1);
    await Future.delayed(const Duration(milliseconds: 400));
    if (mounted) setState(() => _currentStep = 2);
    await Future.delayed(const Duration(milliseconds: 400));
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
        padding: const EdgeInsets.all(22.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Radar Icon
            Stack(
              alignment: Alignment.center,
              children: [
                const SizedBox(
                  width: 68,
                  height: 68,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: Color(0xFF0C355B),
                    backgroundColor: Color(0xFFE2E8F0),
                  ),
                ),
                Container(
                  width: 50,
                  height: 50,
                  decoration: const BoxDecoration(
                    color: Color(0xFF0C355B),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.search, color: Colors.amber, size: 24),
                ),
              ],
            ),
            const SizedBox(height: 18),

            const Text(
              'መረጃ በማመሳከር ላይ...',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0C355B),
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                'ፍተሻ: ${widget.queryValue}',
                style: const TextStyle(fontSize: 11, color: Color(0xFF0C355B), fontWeight: FontWeight.w600),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(height: 18),

            // Neutral inspection steps (no misleading green checkmarks)
            Column(
              children: List.generate(_steps.length, (index) {
                final isPassed = index < _currentStep;
                final isCurrent = index == _currentStep;

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 5.0),
                  child: Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isPassed
                              ? const Color(0xFF0C355B)
                              : isCurrent
                                  ? const Color(0xFF1E5B94)
                                  : Colors.grey.shade200,
                        ),
                        child: Center(
                          child: isPassed
                              ? const Icon(Icons.done, size: 12, color: Colors.white)
                              : isCurrent
                                  ? const SizedBox(
                                      width: 8,
                                      height: 8,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 1.5,
                                        color: Colors.white,
                                      ),
                                    )
                                  : Text(
                                      '${index + 1}',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _steps[index]['am']!,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
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
