// src/components/admin/AdminNavbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logout from '@/components/Logout';

export default function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Verificar autenticación
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Comercios', path: '/admin/commerces', icon: 'store' },
    { name: 'Usuarios', path: '/admin/users', icon: 'users' },
    { name: 'Configuración', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <div className="flex justify-between items-center h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            className="md:hidden p-2 rounded-md hover:bg-blue-700 mr-3"
            onClick={toggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-xl font-bold">Carta En Línea</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="px-3 py-2 rounded hover:bg-white/10 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <div className="hidden md:block mr-3">
              <div className="text-sm">
                <div className="font-medium">{userRole === 'SUPERUSER' ? 'Super Admin' : 'Usuario'}</div>
              </div>
            </div>
            <Logout />
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white text-gray-800 shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
}