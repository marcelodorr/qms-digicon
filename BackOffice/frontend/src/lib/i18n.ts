import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  'pt-BR': {
    translation: {
      sidebar: {
        dashboard: 'Dashboard Certificado',
        registration: 'Cadastro',
        operations: 'Operações',
        purchaseOrders: 'Ordens de Compra',
        norms: 'Normas',
        specialNorms: 'Normas Proc. Especial',
        parameters: 'Parâmetros',
        people: 'Pessoas',
        clients: 'Clientes',
        partNumber: 'PartNumber',
        certificates: 'Certificados',
        qualityMenu: 'Qualidade',
        quality: 'Qualidade',
        specialProcess: 'Processo Especial',
        productCompliance: 'Conf. Produto',
        rncDashboard: 'Dashboard RNC',
        labels: 'Etiquetas',
        shippingLabel: 'Etiqueta de Embarque',
        settings: 'Configurações',
        support: 'Suporte',
        helpCenter: 'Central de Ajuda',
        searchPlaceholder: 'Buscar no menu...',
        searchEmpty: 'Nenhum menu encontrado.',
        searchClear: 'Limpar busca'
      },
      header: {
        searchPlaceholder: 'Buscar em todo sistema...',
        profile: 'Perfil',
        logout: 'Sair'
      },
      settings: {
        title: 'Configurações',
        description: 'Gerencie suas preferências de conta e configurações do sistema.',
        tabs: {
          profile: 'Perfil',
          notifications: 'Notificações',
          appearance: 'Aparência',
          language: 'Idioma',
          email: 'E-mail'
        },
        language: {
          title: 'Idioma',
          description: 'Selecione o idioma de preferência para a interface do sistema.',
          select: 'Selecionar idioma',
          portuguese: 'Português (Brasil)',
          english: 'Inglês',
          spanish: 'Espanhol'
        },
        profile: {
          title: 'Perfil do Usuário',
          description: 'Informações visíveis para outros usuários do sistema.',
          changePhoto: 'Alterar foto',
          name: 'Nome Completo',
          email: 'Email',
          save: 'Salvar Alterações'
        },
        security: {
          title: 'Segurança',
          description: 'Gerencie sua senha de acesso.',
          currentPassword: 'Senha Atual',
          newPassword: 'Nova Senha',
          confirmPassword: 'Confirmar Nova Senha',
          changePassword: 'Alterar Senha'
        },
        appearance: {
          title: 'Aparência',
          description: 'Personalize a aparência do sistema. Alternar automaticamente entre temas dia e noite.',
          light: 'Claro',
          dark: 'Escuro',
          system: 'Sistema'
        },
        email: {
          title: 'Configuração de E-mail',
          description: 'Configure os dados de SMTP para envio de mensagens pelo sistema.',
          host: 'Servidor SMTP',
          port: 'Porta',
          user: 'Usuário',
          password: 'Senha',
          fromEmail: 'E-mail Remetente',
          fromName: 'Nome Remetente',
          useSsl: 'Usar SSL',
          save: 'Salvar Configuração',
          testRecipient: 'Enviar teste para',
          testButton: 'Enviar teste',
          testConnection: 'Testar conexão'
        }
      }
    }
  },
  'en': {
    translation: {
      sidebar: {
        dashboard: 'Certificates Dashboard',
        registration: 'Registration',
        operations: 'Operations',
        purchaseOrders: 'Purchase Orders',
        norms: 'Norms',
        specialNorms: 'Special Proc. Norms',
        parameters: 'Parameters',
        people: 'People',
        clients: 'Clients',
        partNumber: 'PartNumber',
        certificates: 'Certificates',
        qualityMenu: 'Quality',
        quality: 'Quality',
        specialProcess: 'Special Process',
        productCompliance: 'Product Compliance',
        rncDashboard: 'RNC Dashboard',
        labels: 'Labels',
        shippingLabel: 'Shipping Label',
        settings: 'Settings',
        support: 'Support',
        helpCenter: 'Help Center',
        searchPlaceholder: 'Search menu...',
        searchEmpty: 'No menu found.',
        searchClear: 'Clear search'
      },
      header: {
        searchPlaceholder: 'Search in the entire system...',
        profile: 'Profile',
        logout: 'Logout'
      },
      settings: {
        title: 'Settings',
        description: 'Manage your account preferences and system settings.',
        tabs: {
          profile: 'Profile',
          notifications: 'Notifications',
          appearance: 'Appearance',
          language: 'Language',
          email: 'Email'
        },
        language: {
          title: 'Language',
          description: 'Select your preferred language for the system interface.',
          select: 'Select language',
          portuguese: 'Portuguese (Brazil)',
          english: 'English',
          spanish: 'Spanish'
        },
        profile: {
          title: 'User Profile',
          description: 'Information visible to other system users.',
          changePhoto: 'Change photo',
          name: 'Full Name',
          email: 'Email',
          save: 'Save Changes'
        },
        security: {
          title: 'Security',
          description: 'Manage your access password.',
          currentPassword: 'Current Password',
          newPassword: 'New Password',
          confirmPassword: 'Confirm New Password',
          changePassword: 'Change Password'
        },
        appearance: {
          title: 'Appearance',
          description: 'Customize system appearance. Automatically switch between day and night themes.',
          light: 'Light',
          dark: 'Dark',
          system: 'System'
        },
        email: {
          title: 'Email Configuration',
          description: 'Configure SMTP settings to send emails from the system.',
          host: 'SMTP Host',
          port: 'Port',
          user: 'User',
          password: 'Password',
          fromEmail: 'From Email',
          fromName: 'From Name',
          useSsl: 'Use SSL',
          save: 'Save Configuration',
          testRecipient: 'Send test to',
          testButton: 'Send test',
          testConnection: 'Test connection'
        }
      }
    }
  },
  'es': {
    translation: {
      sidebar: {
        dashboard: 'Panel de Certificados',
        registration: 'Registro',
        operations: 'Operaciones',
        purchaseOrders: 'Órdenes de Compra',
        norms: 'Normas',
        specialNorms: 'Normas Proc. Esp.',
        parameters: 'Parámetros',
        people: 'Personas',
        clients: 'Clientes',
        partNumber: 'Número de Parte',
        certificates: 'Certificados',
        qualityMenu: 'Calidad',
        quality: 'Calidad',
        specialProcess: 'Proceso Especial',
        productCompliance: 'Conf. Producto',
        rncDashboard: 'Panel RNC',
        labels: 'Etiquetas',
        shippingLabel: 'Etiqueta de Embarque',
        settings: 'Configuración',
        support: 'Soporte',
        helpCenter: 'Centro de Ayuda',
        searchPlaceholder: 'Buscar en el menu...',
        searchEmpty: 'Ningun menu encontrado.',
        searchClear: 'Limpiar busqueda'
      },
      header: {
        searchPlaceholder: 'Buscar en todo el sistema...',
        profile: 'Perfil',
        logout: 'Cerrar sesión'
      },
      settings: {
        title: 'Configuración',
        description: 'Administre sus preferencias de cuenta y configuraciones del sistema.',
        tabs: {
          profile: 'Perfil',
          notifications: 'Notificaciones',
          appearance: 'Apariencia',
          language: 'Idioma',
          email: 'Correo'
        },
        language: {
          title: 'Idioma',
          description: 'Seleccione el idioma de preferencia para la interfaz del sistema.',
          select: 'Seleccionar idioma',
          portuguese: 'Portugués (Brasil)',
          english: 'Inglés',
          spanish: 'Español'
        },
        profile: {
          title: 'Perfil de Usuario',
          description: 'Información visible para otros usuarios del sistema.',
          changePhoto: 'Cambiar foto',
          name: 'Nombre Completo',
          email: 'Correo electrónico',
          save: 'Guardar Cambios'
        },
        security: {
          title: 'Seguridad',
          description: 'Administre su contraseña de acceso.',
          currentPassword: 'Contraseña Actual',
          newPassword: 'Nueva Contraseña',
          confirmPassword: 'Confirmar Nueva Contraseña',
          changePassword: 'Cambiar Contraseña'
        },
        appearance: {
          title: 'Apariencia',
          description: 'Personalice la apariencia del sistema. Alternar automáticamente entre temas día y noche.',
          light: 'Claro',
          dark: 'Oscuro',
          system: 'Sistema'
        },
        email: {
          title: 'Configuración de Correo',
          description: 'Configure los datos SMTP para enviar mensajes desde el sistema.',
          host: 'Servidor SMTP',
          port: 'Puerto',
          user: 'Usuario',
          password: 'Contraseña',
          fromEmail: 'Correo Remitente',
          fromName: 'Nombre Remitente',
          useSsl: 'Usar SSL',
          save: 'Guardar Configuración',
          testRecipient: 'Enviar prueba a',
          testButton: 'Enviar prueba',
          testConnection: 'Probar conexión'
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en', 'es'],
    debug: false,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
