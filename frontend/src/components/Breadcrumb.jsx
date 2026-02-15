import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

function Breadcrumb({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <nav className="flex items-center text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <Icon
                                    icon="ic:round-chevron-right"
                                    className="mx-2 text-slate-400"
                                    width="20"
                                />
                            )}

                            {item.path && !isLast ? (
                                <Link
                                    to={item.path}
                                    className="hover:text-sea-primary transition-colors flex items-center gap-1"
                                >
                                    {item.icon && <Icon icon={item.icon} />}
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={`flex items-center gap-1 ${isLast ? 'text-sea-text font-medium' : ''}`}>
                                    {item.icon && <Icon icon={item.icon} />}
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumb;
