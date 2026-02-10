import TiltedCard from "../../bits/TiltedCard";
import "./Techs.css";

interface Tech {
    name: string;
    image: string;
    background: string;
    caption: string;
}

function Techs() {

    const techs: Tech[] = [
        {
            name: "Node",
            image: "./webp/node.webp",
            background: "bg-green-500",
            caption: "Node"
        },
        {
            name: "Deno",
            image: "./webp/deno.webp",
            background: "bg-white",
            caption: "Deno"
        },
        {
            name: "C#",
            image: "./webp/csharp.webp",
            background: "bg-purple-300",
            caption: "C#"
        },
        {
            name: ".NET",
            image: "./webp/dotnet.webp",
            background: "bg-purple-400",
            caption: ".NET"
        },
        {
            name: "Python",
            image: "./webp/python.webp",
            background: "bg-yellow-200",
            caption: "Python"
        },
        {
            name: "Typescript",
            image: "./webp/typescript.webp",
            background: "bg-blue-400",
            caption: "Typescript"
        },
        {
            name: "Socket IO",
            image: "./webp/socketio.webp",
            background: "bg-white",
            caption: "Socket IO",
        },
        {
            name: "GraphQL",
            image: "./webp/graphql.webp",
            background: "bg-purple-500",
            caption: "GraphQL"
        },
        {
            name: "Flutter",
            image: "./webp/flutter.webp",
            background: "bg-blue-300",
            caption: "Flutter"
        },
        {
            name: "Postgres",
            image: "./webp/postgres.webp",
            background: "bg-blue-500",
            caption: "Postgres"
        },
        {
            name: "MongoDB",
            image: "./webp/mongo.webp",
            background: "bg-green-500",
            caption: "MongoDB"
        },
        {
            name: "NestJS",
            image: "./webp/nest.webp",
            background: "bg-red-300",
            caption: "NestJS"
        },
        {
            name: "Docker",
            image: "./webp/docker.webp",
            background: "bg-blue-900",
            caption: "Docker"
        },
        {
            name: "Azure",
            image: "./webp/azure.webp",
            background: "bg-blue-500",
            caption: "Azure"
        },
        {
            name: "Jenkins",
            image: "./webp/jenkins.webp",
            background: "bg-red-500",
            caption: "Jenkins"
        },
        {
            name: "NATS",
            image: "./webp/nats.webp",
            background: "bg-green-700",
            caption: "NATS"
        },
        {
            name: "RabbitMQ",
            image: "./webp/rabbitmq.webp",
            background: "bg-orange-600",
            caption: "RabbitMQ"
        },
        {
            name: "Git",
            image: "./webp/git.webp",
            background: "bg-orange-700",
            caption: "Git"
        },
        {
            name: "Jira",
            image: "./webp/jira.webp",
            background: "bg-blue-800",
            caption: "Jira"
        },
        {
            name: "Bitbucket",
            image: "./webp/bitbucket.webp",
            background: "bg-blue-600",
            caption: "Bitbucket"
        },
        {
            name: "Angular",
            image: "./webp/angular.webp",
            background: "bg-purple-700",
            caption: "Angular"
        },
        {
            name: "Qwik",
            image: "./webp/qwik.webp",
            background: "bg-blue-700",
            caption: "QwikJs"
        },
        {
            name: "React",
            image: "./webp/react.webp",
            background: "bg-blue-600",
            caption: "React"
        },
        {
            name: "Mapbox",
            image: "./webp/mapbox.webp",
            background: "bg-black",
            caption: "Mapbox"
        }
    ];


    return <div className="p-10 flex justify-center gap-10 flex-wrap">
        {
            techs.map(t => <TiltedCard key={t.name}
                imageSrc={t.image}
                altText={t.caption}
                captionText={t.caption}
                containerHeight="50px"
                containerWidth="50px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={20}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
            />)
        }

    </div>
}

export default Techs;