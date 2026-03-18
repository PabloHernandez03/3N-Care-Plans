import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button' }) => {
    const baseStyles = 'px-4 py-2 text-md rounded-full font-medium transition-colors';
    const variantStyles = {
        primary: 'bg-primario text-white hover:bg-primario/80',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant]}`}
        >
            {children}
        </button>
    );
};

export default Button;
