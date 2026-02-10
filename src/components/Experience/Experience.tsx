import DecryptedText from "../../bits/DecryptedText";
import GradientText from "../../bits/GradientText";
import Techs from "../Techs/Techs";


function Experience() {

    const experience: string = `Desarrollador con experiencia en el desarrollo web utilizando Angular y React. Poseo sólidos conocimientos en la creación de REST APIs con .NET Core y NestJS, así como en el diseño y desarrollo de aplicaciones en tiempo real con Socket.IO y SignalR.
He trabajado con arquitecturas de microservicios, integrando sistemas a través de NATS y RabbitMQ, y cuento con experiencia en procesos de integración y entrega continua (CI/CD) usando Jenkins y Bitbucket Pipelines.
También tengo conocimientos básicos en el uso de Microsoft Azure y experiencia en el desarrollo de aplicaciones móviles con Flutter. Entre mis proyectos destaca la creación de la aplicación de Makro Parque (Makro TODO), desde su diseño hasta su implementación.
Complemento mi perfil con experiencia básica en la gestión de proyectos de desarrollo de software, lo que me permite participar tanto en la ejecución técnica como en la coordinación de equipos y entregables.`;

    return <section className="px-12 pt-3 pb-10  grid md:grid-cols-2">
        <div className="flex justify-center">
            <Techs />
        </div>
        <div className="sm:px-5">
            <GradientText colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false} className="text-5xl">Experiencia</GradientText>
            <div className="pt-2 flex justify-center">
                <DecryptedText speed={30} maxIterations={10} text={experience} animateOn="view" className="font-bold" />
            </div>
        </div>
    </section>
}

export default Experience;