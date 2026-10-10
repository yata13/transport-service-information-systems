import 'package:flutter/material.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/app_drawer.dart';
import 'verification_screen.dart';
import 'reports_screen.dart';
import 'settings_screen.dart';
import 'login_screen.dart';

class AppShell extends StatefulWidget {
  final String officerName;
  final String badgeNumber;
  final String officerRole;

  const AppShell({
    super.key,
    required this.officerName,
    required this.badgeNumber,
    required this.officerRole,
  });

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _currentScreen = 'verification';

  void _handleNavigate(String screen) {
    setState(() => _currentScreen = screen);
  }

  void _handleLogout() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget bodyContent;

    switch (_currentScreen) {
      case 'reports':
      case 'story':
        bodyContent = const ReportsScreen();
        break;
      case 'settings':
        bodyContent = SettingsScreen(
          officerName: widget.officerName,
          badgeNumber: widget.badgeNumber,
          onLogout: _handleLogout,
        );
        break;
      case 'verification':
      default:
        bodyContent = VerificationScreen(onNavigate: _handleNavigate);
        break;
    }

    // Determine active index for bottom navigation bar
    int currentIndex = 0;
    if (_currentScreen == 'reports' || _currentScreen == 'story') {
      currentIndex = 1;
    } else if (_currentScreen == 'settings') {
      currentIndex = 2;
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppTopBar(
        onToggleDrawer: () {
          if (_scaffoldKey.currentState?.isDrawerOpen ?? false) {
            _scaffoldKey.currentState?.closeDrawer();
          } else {
            _scaffoldKey.currentState?.openDrawer();
          }
        },
      ),
      drawer: AppDrawer(
        currentScreen: _currentScreen,
        onNavigate: _handleNavigate,
        onLogout: _handleLogout,
        officerName: widget.officerName,
        badgeNumber: widget.badgeNumber,
        officerRole: widget.officerRole,
      ),
      body: bodyContent,
      // Dedicated Mobile Bottom Navigation Bar: Verification, Story, Settings
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) {
          if (index == 0) _handleNavigate('verification');
          if (index == 1) _handleNavigate('story');
          if (index == 2) _handleNavigate('settings');
        },
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF0C355B),
        unselectedItemColor: Colors.grey.shade500,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 10),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_scanner),
            activeIcon: Icon(Icons.qr_code_scanner, color: Color(0xFF0C355B)),
            label: 'ፍተሻ (Verify)',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            activeIcon: Icon(Icons.history, color: Color(0xFF0C355B)),
            label: 'ታሪክ (Story)',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            activeIcon: Icon(Icons.settings, color: Color(0xFF0C355B)),
            label: 'ቅንብሮች (Settings)',
          ),
        ],
      ),
    );
  }
}
