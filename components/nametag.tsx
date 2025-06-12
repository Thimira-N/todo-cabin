"use client"

import {
    MessageCircle,
    Code,
    Github,
    Linkedin,
    Mail
} from 'lucide-react'

export const NameTag = ({ collapsed = false }: { collapsed?: boolean }) => {
    if (collapsed) {
        // Collapsed state - just show avatar with tooltip
        return (
            <div className="group relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-all duration-300 shadow-md">
                    <Code size={14} className="text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-full ml-10 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border">
                    <div className="text-xs text-muted-foreground">Developed by:</div>
                    <div className="text-sm font-medium">Thimira Navodana</div>
                    <div className="text-xs text-muted-foreground">Full Stack Developer</div>
                </div>
            </div>
        );
    }

    // Expanded state - full name tag
    return (
        <div className="space-y-3 items-start flex flex-col">
            {/* Developer info */}
            <div className="group cursor-pointer flex items-center gap-2">
                <div className="mt-5 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md">
                    <Code size={14} className="text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
              <span className="mb-1 -ml-10 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Developed by:
            </span>
                    <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 truncate">
              Thimira Navodana
            </span>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Full Stack Developer
            </span>
                </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 justify-center">
                <a
                    href="https://wa.me/+94716337787?text=Hello%20Thimira!%20%20I'm%20from%20ToDo%20Cabin."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social w-7 h-7 bg-accent hover:bg-accent/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="WhatsApp"
                >
                    <MessageCircle size={12} className="text-green-500 group-hover/social:text-green-700 transition-colors duration-300" />
                </a>

                <a
                    href="https://github.com"
                    className="group/social w-7 h-7 bg-accent hover:bg-accent/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="GitHub"
                >
                    <Github size={12} className="text-muted-foreground group-hover/social:text-foreground transition-colors duration-300" />
                </a>

                <a
                    href="https://www.linkedin.com/in/itz-thimira"
                    className="group/social w-7 h-7 bg-accent hover:bg-accent/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="LinkedIn"
                >
                    <Linkedin size={12} className="text-blue-600 group-hover/social:text-blue-800 transition-colors duration-300" />
                </a>

                <a
                    href="mailto:thimiranavodana2002@gmail.com"
                    className="group/social w-7 h-7 bg-accent hover:bg-accent/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Email"
                >
                    <Mail size={12} className="text-green-600 group-hover/social:text-green-800 transition-colors duration-300" />
                </a>
            </div>
        </div>
    );
};