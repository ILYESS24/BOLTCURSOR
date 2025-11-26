/**
 * Générateurs spécialisés - Intégration des meilleures fonctionnalités
 * de tous les AI App Builders
 */

import type { AppSpecification, GeneratedFile } from './core';

/**
 * Générateur de composants UI - Comme Bubble + Capacity
 */
export class UIComponentGenerator {
  async generateComponents(spec: AppSpecification): Promise<GeneratedFile[]> {
    const components = [];
    
    // Composants de base
    components.push(...await this.generateBaseComponents(spec));
    
    // Composants spécifiques aux fonctionnalités
    components.push(...await this.generateFeatureComponents(spec));
    
    // Composants de layout
    components.push(...await this.generateLayoutComponents(spec));
    
    return components;
  }

  private async generateBaseComponents(spec: AppSpecification): Promise<GeneratedFile[]> {
    const baseComponents = [
      'Button', 'Input', 'Modal', 'Card', 'Badge', 'Alert', 'Spinner', 'Tooltip'
    ];

    return baseComponents.map(component => ({
      path: `src/components/ui/${component}.tsx`,
      content: this.generateUIComponent(component, spec.framework),
      type: 'component' as const
    }));
  }

  private async generateFeatureComponents(spec: AppSpecification): Promise<GeneratedFile[]> {
    const components = [];

    if (spec.features.includes('authentication')) {
      components.push(
        this.generateAuthComponent('LoginForm', spec),
        this.generateAuthComponent('RegisterForm', spec),
        this.generateAuthComponent('PasswordReset', spec)
      );
    }

    if (spec.features.includes('dashboard')) {
      components.push(
        this.generateDashboardComponent('Dashboard', spec),
        this.generateDashboardComponent('StatsCard', spec),
        this.generateDashboardComponent('Chart', spec)
      );
    }

    if (spec.features.includes('crud')) {
      components.push(
        this.generateCRUDComponent('DataTable', spec),
        this.generateCRUDComponent('FormModal', spec),
        this.generateCRUDComponent('DeleteConfirm', spec)
      );
    }

    if (spec.features.includes('chat')) {
      components.push(
        this.generateChatComponent('ChatInterface', spec),
        this.generateChatComponent('MessageList', spec),
        this.generateChatComponent('MessageInput', spec)
      );
    }

    return components;
  }

  private async generateLayoutComponents(spec: AppSpecification): Promise<GeneratedFile[]> {
    return [
      {
        path: 'src/components/layout/Header.tsx',
        content: this.generateLayoutComponent('Header', spec),
        type: 'component' as const
      },
      {
        path: 'src/components/layout/Sidebar.tsx',
        content: this.generateLayoutComponent('Sidebar', spec),
        type: 'component' as const
      },
      {
        path: 'src/components/layout/Footer.tsx',
        content: this.generateLayoutComponent('Footer', spec),
        type: 'component' as const
      }
    ];
  }

  private generateUIComponent(name: string, framework: string): string {
    const templates: { [key: string]: string } = {
      Button: `
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = \`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
`,
      Input: `
import React from 'react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = ''
}) => {
  return (
    <div className={\`\${className}\`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={\`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          \${error ? 'border-red-500' : 'border-gray-300'}
          \${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        \`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
`,
      Modal: `
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className={\`
          inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl
          transform transition-all sm:my-8 sm:align-middle \${sizeClasses[size]} sm:w-full
          \${className}
        \`}>
          {title && (
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
            </div>
          )}
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
`
    };

    return templates[name] || this.generateGenericComponent(name);
  }

  private generateAuthComponent(name: string, spec: AppSpecification): GeneratedFile {
    const templates: { [key: string]: string } = {
      LoginForm: `
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        placeholder="Enter your email"
      />
      
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        placeholder="Enter your password"
      />
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
};
`,
      RegisterForm: `
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RegisterFormProps {
  onSubmit: (data: { name: string; email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading = false, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    await onSubmit({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={name}
        onChange={setName}
        required
        placeholder="Enter your full name"
      />
      
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        placeholder="Enter your email"
      />
      
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        placeholder="Create a password"
      />
      
      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
        placeholder="Confirm your password"
      />
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        Create Account
      </Button>
    </form>
  );
};
`
    };

    return {
      path: `src/components/auth/${name}.tsx`,
      content: templates[name] || this.generateGenericComponent(name),
      type: 'component' as const
    };
  }

  private generateDashboardComponent(name: string, spec: AppSpecification): GeneratedFile {
    const templates: { [key: string]: string } = {
      Dashboard: `
import React from 'react';
import { StatsCard } from './StatsCard';
import { Chart } from './Chart';

interface DashboardProps {
  stats: Array<{
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
  }>;
  chartData: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, chartData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
          />
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Analytics</h3>
        <Chart data={chartData} />
      </div>
    </div>
  );
};
`,
      StatsCard: `
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend }) => {
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend === 'up' ? '↗' : '↘';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={\`text-sm \${trendColor}\`}>
        {trendIcon} {Math.abs(change)}% from last month
      </p>
    </div>
  );
};
`
    };

    return {
      path: `src/components/dashboard/${name}.tsx`,
      content: templates[name] || this.generateGenericComponent(name),
      type: 'component' as const
    };
  }

  private generateCRUDComponent(name: string, spec: AppSpecification): GeneratedFile {
    const templates: { [key: string]: string } = {
      DataTable: `
import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface DataTableProps {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  loading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(column.key)}
              >
                {column.label}
                {sortField === column.key && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {onEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(row)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
`
    };

    return {
      path: `src/components/crud/${name}.tsx`,
      content: templates[name] || this.generateGenericComponent(name),
      type: 'component' as const
    };
  }

  private generateChatComponent(name: string, spec: AppSpecification): GeneratedFile {
    const templates: { [key: string]: string } = {
      ChatInterface: `
import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  loading?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  loading = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} />
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
`,
      MessageList: `
import React from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={\`flex \${message.sender === 'user' ? 'justify-end' : 'justify-start'}\`}
        >
          <div
            className={\`
              max-w-xs lg:max-w-md px-4 py-2 rounded-lg
              \${message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
              }
            \`}
          >
            <p className="text-sm">{message.text}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
`,
      MessageInput: `
import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit" disabled={!text.trim()}>
        Send
      </Button>
    </form>
  );
};
`
    };

    return {
      path: `src/components/chat/${name}.tsx`,
      content: templates[name] || this.generateGenericComponent(name),
      type: 'component' as const
    };
  }

  private generateLayoutComponent(name: string, spec: AppSpecification): string {
    const templates: { [key: string]: string } = {
      Header: `
import React from 'react';
import { Button } from '../ui/Button';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              ${spec.name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  Welcome, {user.name}
                </div>
                {onLogout && (
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    Logout
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
                <Button size="sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
`,
      Sidebar: `
import React from 'react';

interface SidebarProps {
  navigation: Array<{
    name: string;
    href: string;
    icon?: React.ReactNode;
    current?: boolean;
  }>;
  onNavigate: (href: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navigation, onNavigate }) => {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      
      <nav className="mt-4">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.href);
            }}
            className={\`
              flex items-center px-4 py-2 text-sm font-medium
              \${item.current
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            \`}
          >
            {item.icon && <span className="mr-3">{item.icon}</span>}
            {item.name}
          </a>
        ))}
      </nav>
    </div>
  );
};
`
    };

    return templates[name] || this.generateGenericComponent(name);
  }

  private generateGenericComponent(name: string): string {
    return `
import React from 'react';

interface ${name}Props {
  // Props will be defined based on component requirements
}

export const ${name}: React.FC<${name}Props> = (props) => {
  return (
    <div className="${name.toLowerCase()}">
      {/* Component implementation */}
    </div>
  );
};
`;
  }
}

/**
 * Générateur de pages - Comme Next.js + Nuxt
 */
export class PageGenerator {
  async generatePages(spec: AppSpecification): Promise<GeneratedFile[]> {
    const pages = [];

    // Page d'accueil
    pages.push(this.generateHomePage(spec));

    // Pages d'authentification
    if (spec.features.includes('authentication')) {
      pages.push(this.generateAuthPages(spec));
    }

    // Pages de dashboard
    if (spec.features.includes('dashboard')) {
      pages.push(this.generateDashboardPages(spec));
    }

    // Pages CRUD
    if (spec.features.includes('crud')) {
      pages.push(this.generateCRUDPages(spec));
    }

    return pages.flat();
  }

  private generateHomePage(spec: AppSpecification): GeneratedFile {
    return {
      path: 'src/pages/index.tsx',
      content: `
import React from 'react';
import Head from 'next/head';
import { Button } from '../components/ui/Button';

export default function Home() {
  return (
    <>
      <Head>
        <title>${spec.name}</title>
        <meta name="description" content="${spec.description}" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to ${spec.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              ${spec.description}
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg">
                Get Started
              </Button>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            ${spec.features.map(feature => `
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">${this.formatFeatureName(feature)}</h3>
                <p className="text-gray-600">
                  ${this.getFeatureDescription(feature)}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </main>
    </>
  );
}
`,
      type: 'page' as const
    };
  }

  private generateAuthPages(spec: AppSpecification): GeneratedFile[] {
    return [
      {
        path: 'src/pages/login.tsx',
        content: `
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { LoginForm } from '../components/auth/LoginForm';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - ${spec.name}</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </>
  );
}
`,
        type: 'page' as const
      },
      {
        path: 'src/pages/register.tsx',
        content: `
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RegisterForm } from '../components/auth/RegisterForm';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        router.push('/login?message=Registration successful');
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register - ${spec.name}</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          
          <RegisterForm
            onSubmit={handleRegister}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </>
  );
}
`,
        type: 'page' as const
      }
    ];
  }

  private generateDashboardPages(spec: AppSpecification): GeneratedFile[] {
    return [
      {
        path: 'src/pages/dashboard.tsx',
        content: `
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Dashboard } from '../components/dashboard/Dashboard';

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, chartResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/chart')
        ]);

        const statsData = await statsResponse.json();
        const chartData = await chartResponse.json();

        setStats(statsData);
        setChartData(chartData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - ${spec.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Dashboard stats={stats} chartData={chartData} />
      </div>
    </>
  );
}
`,
        type: 'page' as const
      }
    ];
  }

  private generateCRUDPages(spec: AppSpecification): GeneratedFile[] {
    return [
      {
        path: 'src/pages/items/index.tsx',
        content: `
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { DataTable } from '../../components/crud/DataTable';
import { Button } from '../../components/ui/Button';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    // Handle edit logic
    console.log('Edit item:', item);
  };

  const handleDelete = async (item: any) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(\`/api/items/\${item.id}\`, { method: 'DELETE' });
        fetchItems();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Created At', render: (value: string) => new Date(value).toLocaleDateString() }
  ];

  return (
    <>
      <Head>
        <title>Items - ${spec.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Items</h1>
            <Button>Add New Item</Button>
          </div>
          
          <DataTable
            data={items}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
`,
        type: 'page' as const
      }
    ];
  }

  private formatFeatureName(feature: string): string {
    return feature.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private getFeatureDescription(feature: string): string {
    const descriptions: { [key: string]: string } = {
      'authentication': 'Secure user authentication and authorization',
      'dashboard': 'Comprehensive analytics and data visualization',
      'crud': 'Create, read, update, and delete operations',
      'chat': 'Real-time messaging and communication',
      'file-upload': 'Secure file upload and management',
      'notification': 'Push notifications and alerts',
      'payment': 'Payment processing and billing',
      'admin': 'Administrative panel and user management'
    };
    
    return descriptions[feature] || 'Advanced functionality for your application';
  }
}

/**
 * Générateur d'APIs - Comme Backendless + Bubble
 */
export class APIGenerator {
  async generateAPIs(spec: AppSpecification): Promise<GeneratedFile[]> {
    const apis = [];

    // APIs d'authentification
    if (spec.features.includes('authentication')) {
      apis.push(...this.generateAuthAPIs(spec));
    }

    // APIs CRUD
    if (spec.features.includes('crud')) {
      apis.push(...this.generateCRUDAPIs(spec));
    }

    // APIs de dashboard
    if (spec.features.includes('dashboard')) {
      apis.push(...this.generateDashboardAPIs(spec));
    }

    // APIs de chat
    if (spec.features.includes('chat')) {
      apis.push(...this.generateChatAPIs(spec));
    }

    return apis;
  }

  private generateAuthAPIs(spec: AppSpecification): GeneratedFile[] {
    return [
      {
        path: 'src/pages/api/auth/login.ts',
        content: `
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user in database
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Update last login
    await updateLastLogin(user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function findUserByEmail(email: string) {
  // Database query implementation
  // This would connect to your actual database
  return null;
}

async function updateLastLogin(userId: string) {
  // Update last login timestamp
  // This would update your actual database
}
`,
        type: 'api' as const
      },
      {
        path: 'src/pages/api/auth/register.ts',
        content: `
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function findUserByEmail(email: string) {
  // Database query implementation
  return null;
}

async function createUser(userData: { name: string; email: string; password: string }) {
  // Database insert implementation
  return {
    id: 'user-id',
    name: userData.name,
    email: userData.email
  };
}
`,
        type: 'api' as const
      }
    ];
  }

  private generateCRUDAPIs(spec: AppSpecification): GeneratedFile[] {
    return [
      {
        path: 'src/pages/api/items/index.ts',
        content: `
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(\`Method \${req.method} Not Allowed\`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 10, search } = req.query;
  
  try {
    const items = await getItems({
      page: Number(page),
      limit: Number(limit),
      search: search as string
    });

    res.status(200).json({
      items: items.data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: items.total,
        pages: Math.ceil(items.total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const item = await createItem({ name, description });
    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
}

async function getItems(params: { page: number; limit: number; search?: string }) {
  // Database query implementation
  return {
    data: [],
    total: 0
  };
}

async function createItem(data: { name: string; description?: string }) {
  // Database insert implementation
  return {
    id: 'item-id',
    ...data,
    createdAt: new Date().toISOString()
  };
}
`,
        type: 'api' as const
      },
      {
        path: 'src/pages/api/items/[id].ts',
        content: `
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, id as string);
      case 'PUT':
        return await handlePut(req, res, id as string);
      case 'DELETE':
        return await handleDelete(req, res, id as string);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(\`Method \${req.method} Not Allowed\`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const item = await getItemById(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { name, description } = req.body;

  try {
    const item = await updateItem(id, { name, description });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const deleted = await deleteItem(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
}

async function getItemById(id: string) {
  // Database query implementation
  return null;
}

async function updateItem(id: string, data: { name?: string; description?: string }) {
  // Database update implementation
  return null;
}

async function deleteItem(id: string) {
  // Database delete implementation
  return false;
}
`,
        type: 'api' as const
      }
    ];
  }

  private generateDashboardAPIs(spec: AppSpecification): GeneratedFile[] {
    return [
      {
        path: 'src/pages/api/dashboard/stats.ts',
        content: `
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

async function getDashboardStats() {
  // Database queries to get various statistics
  return [
    {
      title: 'Total Users',
      value: '1,234',
      change: 12,
      trend: 'up'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: -3,
      trend: 'down'
    },
    {
      title: 'Orders',
      value: '567',
      change: 8,
      trend: 'up'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: 15,
      trend: 'up'
    }
  ];
}
`,
        type: 'api' as const
      }
    ];
  }

  private generateChatAPIs(spec: AppSpecification): GeneratedFile[] {
    return [
      {
        path: 'src/pages/api/chat/messages.ts',
        content: `
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(\`Method \${req.method} Not Allowed\`);
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { roomId } = req.query;
  
  try {
    const messages = await getMessages(roomId as string);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { roomId, text, sender } = req.body;

  if (!roomId || !text || !sender) {
    return res.status(400).json({ error: 'Room ID, text, and sender are required' });
  }

  try {
    const message = await createMessage({
      roomId,
      text,
      sender,
      timestamp: new Date()
    });

    // Emit to WebSocket clients
    // This would integrate with your WebSocket server

    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
}

async function getMessages(roomId: string) {
  // Database query to get messages for a room
  return [];
}

async function createMessage(data: { roomId: string; text: string; sender: string; timestamp: Date }) {
  // Database insert to create a new message
  return {
    id: 'message-id',
    ...data,
    timestamp: data.timestamp.toISOString()
  };
}
`,
        type: 'api' as const
      }
    ];
  }
}