import { motion } from "framer-motion";

export const LoadingScreen = () => {
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:to-slate-900"
            >
                {/* Logo & App Name */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col items-center gap-2"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2,
                        }}
                    >
                        {/*animated logo*/}
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 2,
                            }}
                            className="relative w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-600 to-blue-500 dark:from-purple-700 dark:to-blue-600"
                        >
                            <img
                                src="/loading.svg"
                                alt="ToDo Cabin Logo"
                                className="w-10 h-10 object-contain"
                                style={{
                                    filter: "brightness(0) invert(1)",
                                    maskImage: "url('/loading.svg')",
                                    maskSize: "contain",
                                }}
                            />
                        </motion.div>
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ToDo Cabin
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Tidy tasks . Cozy logs . Teamwork that sticks
                    </p>
                </motion.div>

                {/* Animated Spinner */}
                <motion.div
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                    }}
                    className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"
                />
            </motion.div>
        </>
    );
};