// /**
//  * @license
//  * SPDX-License-Identifier: Apache-2.0
//  */

// import React from "react";

// interface LogoProps {
//   className?: string;
//   iconOnly?: boolean;
// }

// export default function Logo({ className = "", iconOnly = false }: LogoProps) {
//   return (
//     <div className={`flex items-center gap-3 select-none ${className}`}>
//       {/* Precision High Fidelity Vector Render of the Swasti.ai Biotech Cross Logo */}
//       <svg
//         viewBox="0 0 120 120"
//         className="w-11 h-11 shrink-0"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <defs>
//           <linearGradient id="swastiGradient" x1="0%" y1="100%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#14b8a6" />
//             <stop offset="35%" stopColor="#0d9488" />
//             <stop offset="70%" stopColor="#22c55e" />
//             <stop offset="100%" stopColor="#84cc16" />
//           </linearGradient>
//         </defs>

//         {/* Top Loop (Lobe) of the Cross */}
//         <path
//           d="M 55 60
//              C 55 38, 38 22, 55 22
//              C 72 22, 72 40, 55 60"
//           stroke="url(#swastiGradient)"
//           strokeWidth="6"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           fill="none"
//         />

//         {/* Left Loop (Lobe) of the Cross */}
//         <path
//           d="M 55 60
//              C 32 60, 20 40, 20 58
//              C 20 76, 38 72, 55 60"
//           stroke="url(#swastiGradient)"
//           strokeWidth="6"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           fill="none"
//         />

//         {/* Bottom Loop (Lobe) of the Cross */}
//         <path
//           d="M 55 60
//              C 55 82, 38 98, 55 98
//              C 72 98, 72 80, 55 60"
//           stroke="url(#swastiGradient)"
//           strokeWidth="6"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           fill="none"
//         />

//         {/* Open Right Lobe and Neural AI network connections */}
        
//         {/* Upper curved branch meeting top-right node */}
//         <path
//           d="M 55 60 
//              C 65 52, 75 42, 85 40"
//           stroke="url(#swastiGradient)"
//           strokeWidth="5"
//           strokeLinecap="round"
//           fill="none"
//         />

//         {/* Lower curved branch meeting bottom-right node */}
//         <path
//           d="M 55 60 
//              C 68 62, 78 72, 88 68"
//           stroke="url(#swastiGradient)"
//           strokeWidth="5"
//           strokeLinecap="round"
//           fill="none"
//         />

//         {/* Central diagonal neural pipeline spine */}
//         <line
//           x1="45"
//           y1="70"
//           x2="85"
//           y2="40"
//           stroke="url(#swastiGradient)"
//           strokeWidth="6.5"
//           strokeLinecap="round"
//         />

//         {/* Neural Network Nodes/Nexus matching the Biotech design */}
//         {/* Central main joint */}
//         <circle cx="55" cy="60" r="7.5" fill="url(#swastiGradient)" />

//         {/* Satellite nodes */}
//         <circle cx="85" cy="40" r="5" fill="#84cc16" />
//         <circle cx="72" cy="50" r="4" fill="url(#swastiGradient)" />
//         <circle cx="88" cy="68" r="6" fill="#84cc16" />
//         <circle cx="95" cy="54" r="4.5" fill="#a3e635" />
//       </svg>

//       {!iconOnly && (
//         <div className="flex flex-col justify-center">
//           <span className="text-[25px] font-bold tracking-tight text-slate-850 text-slate-800 leading-none font-sans">
//             swasti<span className="text-slate-800 font-medium">.ai</span>
//           </span>
//           <span className="text-[7.5px] uppercase font-bold tracking-[0.16em] text-slate-500 mt-1.5 whitespace-nowrap block">
//             AI-BASED HOSPITAL INFORMATION SYSTEM
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import React, { useState } from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ 
  className = "", 
  iconOnly = false,
  size = "md" 
}: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
  sm: "w-24 h-10",
  md: "w-40 h-16",
  lg: "w-56 h-20",
  xl: "w-72 h-24"
};

  return (
    <div className={`flex items-center select-none ${className}`}>
      {!imgError ? (
        <img
          src="/Swasti.ai bg rm logo.png"
          alt="Swasti.ai Logo"
          className={`${sizeMap[size]} object-contain shrink-0`}
          onError={() => setImgError(true)}
        />
      ) : (
        // Fallback - transparent background
        <div className={`${sizeMap[size]} flex items-center justify-center text-teal-600 font-bold shrink-0`}>
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="45" stroke="#2BB2A7" strokeWidth="4" fill="none" />
            <text x="60" y="72" textAnchor="middle" fontSize="45" fill="#2BB2A7" fontWeight="bold">
              S
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}