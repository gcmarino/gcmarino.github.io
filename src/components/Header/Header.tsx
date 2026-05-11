import { motion, useScroll, useTransform } from "framer-motion";
import Aurora from "../../bits/Aurora";
import RotatingText from "../../bits/RotatingText";
import "./Header.css"

function Header() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    return (
        <header className="h-screen relative">
            <Aurora
                colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
                speed={0.5} />
            <motion.section style={{ opacity }} className="absolute top-0 w-full h-full flex justify-center flex-col items-center gap-6">
                <motion.img
                    style={{
                        borderColor: "cyan",
                        borderWidth: "4px",
                        borderStyle: "solid",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        imageRendering: "pixelated",
                    }}
                    whileHover={{ scale: 1.05, cursor: "pointer" }}
                    src="webp/me.webp"
                    alt=""
                    className="h-[280px]"
                />
                <div className="flex items-center flex-wrap justify-center gap-2">
                    <RotatingText
                        texts={["Frontend", "Backend", "Mobile"]}
                        mainClassName="text-xl px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-1 sm:py-1 md:py-2 justify-center font-pixel"
                        staggerFrom={"last"}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        rotationInterval={3000}
                    />
                    <span className="text-xl font-pixel">
                        developer!<span className="cursor-blink">█</span>
                    </span>
                </div>
            </motion.section>
        </header>
    );
}

export default Header;
