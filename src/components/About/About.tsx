import Carousel, { CarouselItem } from "../../bits/Carousel";
import DecryptedText from "../../bits/DecryptedText";
import GradientText from "../../bits/GradientText";
import ShinyText from "../../bits/ShinyText";
import Social from "../Social/Social";

const experience: CarouselItem[] = [
    {
        title: "Mevolución",
        description: "Desarrollador fullstack (2019-2023)",
        id: 1,
        icon: (<img src="webp/mevolucion.webp" />)
    },
    {
        title: "Makro Parque",
        description: "Encargado de desarrollo (2023-2025)",
        id: 2,
        icon: (<img src="webp/makro.webp" />)
    },
    {
        title: "Te Lo Compro",
        description: "Project Manager (Actualmente)",
        id: 3,
        icon: (<img src="webp/telocompro.webp" />)
    },
]

function About() {

    const about: string = "¡Hola!, soy Gian, un desarrollador de aplicaciones móviles y fullstack, soy de 🇨🇴, pero vivo en 🇧🇴 actualmente. Tengo 28 años y comencé a programar desde los 14 como un hobby y actualmente es mi trabajo 😃. Soy una persona autodidacta, me gusta estar al tanto de las novedades en el mundo de la programación y la tecnología.";

    return <section className="px-12 pt-3 pb-10  grid md:grid-cols-2">
        <div className="sm:px-5">
            <GradientText colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false} className="text-5xl">Acerca de mí</GradientText>
            <div className="pt-2 flex justify-center">
                <DecryptedText speed={30} maxIterations={10} text={about} animateOn="view" className="font-bold" />
            </div>
            <Social />
            <div className="flex justify-center mb-4">
                <ShinyText text="gcmarino99@gmail.com" speed={3} />
            </div>
        </div>
        <div className="flex justify-center">
            <Carousel round autoplay items={experience} loop baseWidth={300} />
        </div>
    </section>
}

export default About;