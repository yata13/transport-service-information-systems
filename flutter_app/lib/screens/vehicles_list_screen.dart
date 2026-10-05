import 'package:flutter/material.dart';
import '../models/bajaj_vehicle.dart';
import '../services/supabase_service.dart';
import 'validity_result_screen.dart';

class VehiclesListScreen extends StatefulWidget {
  final Function(String screen)? onNavigate;

  const VehiclesListScreen({super.key, this.onNavigate});

  @override
  State<VehiclesListScreen> createState() => _VehiclesListScreenState();
}

class _VehiclesListScreenState extends State<VehiclesListScreen> {
  final _searchController = TextEditingController();
  String _selectedFilter = 'ALL';
  List<BajajVehicle> _allVehicles = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  void _loadVehicles() async {
    final list = await SupabaseService.getAllVehicles();
    if (mounted) {
      setState(() {
        _allVehicles = list;
        _isLoading = false;
      });
    }
  }

  List<BajajVehicle> get _filteredVehicles {
    final query = _searchController.text.trim().toLowerCase();
    return _allVehicles.where((v) {
      final matchesFilter = _selectedFilter == 'ALL' || v.status == _selectedFilter;
      final matchesQuery = query.isEmpty ||
          v.plateNumber.toLowerCase().contains(query) ||
          v.digitalId.toLowerCase().contains(query) ||
          v.driverName.toLowerCase().contains(query) ||
          v.owner.toLowerCase().contains(query) ||
          v.kebele.toLowerCase().contains(query);
      return matchesFilter && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(14.0),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'በሰሌዳ፣ በስም ወይም በዲጂታል መታወቂያ ፈልግ...',
                    prefixIcon: const Icon(Icons.search, size: 18),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close, size: 16),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {});
                            },
                          )
                        : null,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', 'ሁሉም (All)'),
                      const SizedBox(width: 6),
                      _buildFilterChip('ACTIVE', 'ህጋዊ (Active)'),
                      const SizedBox(width: 6),
                      _buildFilterChip('EXPIRED', 'ጊዜው ያለፈበት (Expired)'),
                      const SizedBox(width: 6),
                      _buildFilterChip('SUSPENDED', 'የታገደ (Suspended)'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0C355B)))
                : _filteredVehicles.isEmpty
                    ? const Center(
                        child: Text(
                          'ምንም የተገኘ ባጃጅ የለም (No Bajajs Found)',
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _filteredVehicles.length,
                        itemBuilder: (context, index) {
                          final v = _filteredVehicles[index];
                          final isActive = v.status == 'ACTIVE';
                          final isExpired = v.status == 'EXPIRED';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 1.5,
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Row(
                                children: [
                                  // Photo
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(10),
                                    child: v.driverPhoto.isNotEmpty
                                        ? Image.network(
                                            v.driverPhoto,
                                            width: 54,
                                            height: 54,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => Container(
                                              width: 54,
                                              height: 54,
                                              color: Colors.grey.shade200,
                                              child: const Icon(Icons.person, color: Colors.grey),
                                            ),
                                          )
                                        : Container(
                                            width: 54,
                                            height: 54,
                                            color: Colors.grey.shade200,
                                            child: const Icon(Icons.person, color: Colors.grey),
                                          ),
                                  ),
                                  const SizedBox(width: 12),

                                  // Details
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF0C355B),
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                v.plateNumber,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 11,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: isActive
                                                    ? Colors.green.shade50
                                                    : isExpired
                                                        ? Colors.amber.shade50
                                                        : Colors.red.shade50,
                                                borderRadius: BorderRadius.circular(4),
                                                border: Border.all(
                                                  color: isActive
                                                      ? Colors.green.shade400
                                                      : isExpired
                                                          ? Colors.amber.shade400
                                                          : Colors.red.shade400,
                                                ),
                                              ),
                                              child: Text(
                                                v.status,
                                                style: TextStyle(
                                                  color: isActive
                                                      ? Colors.green.shade800
                                                      : isExpired
                                                          ? Colors.amber.shade900
                                                          : Colors.red.shade900,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 9,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          v.driverName.isNotEmpty && v.driverName != 'ያልተመዘገበ' ? v.driverName : v.owner,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                        ),
                                        Text(
                                          '${v.kebele} · ${v.bajajAssociation}',
                                          style: const TextStyle(fontSize: 10, color: Colors.grey),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Verify Action Button
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => ValidityResultScreen(
                                            vehicle: v,
                                            onNavigate: widget.onNavigate,
                                          ),
                                        ),
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0C355B),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                      minimumSize: Size.zero,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: const Text('ፈትሽ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String filterId, String label) {
    final isSelected = _selectedFilter == filterId;
    return ChoiceChip(
      label: Text(label, style: const TextStyle(fontSize: 10)),
      selected: isSelected,
      selectedColor: const Color(0xFF0C355B),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      onSelected: (_) => setState(() => _selectedFilter = filterId),
    );
  }
}
