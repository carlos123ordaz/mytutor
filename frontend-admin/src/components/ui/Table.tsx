import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table {...props} className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead {...props} className={cn('bg-gray-50 border-b border-gray-200', className)}>
      {children}
    </thead>
  );
}

export function Tbody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody {...props} className={cn('divide-y divide-gray-100', className)}>
      {children}
    </tbody>
  );
}

export function Th({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...props} className={cn('px-4 py-3 text-gray-700', className)}>
      {children}
    </td>
  );
}

export function Tr({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr {...props} className={cn('hover:bg-gray-50 transition-colors', className)}>
      {children}
    </tr>
  );
}
