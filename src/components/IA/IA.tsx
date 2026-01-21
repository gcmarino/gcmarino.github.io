import DecryptedText from "../../bits/DecryptedText";
import ElectricBorder from "../../bits/ElectricBorder";
import Folder from "../../bits/FolderProps";
import GradientText from "../../bits/GradientText";

function IA() {

    const experience: string = `Especialista en automatización de procesos con n8n, desde flujos simples hasta pipelines complejos con múltiples integraciones.
Diseño y desarrollo de agentes de IA personalizados para atención, análisis, orquestación de procesos y automatización avanzada.`;

    const folderItems = [
        <div className="flex items-center justify-center h-full">
            <img src="./excel.png" className="w-12" />,
        </div>,
        <div className="flex items-center justify-center h-full">
            <img src="./googledrive.png" className="w-12" />,
        </div>,
        <div className="flex items-center justify-center h-full">
            <img src="./telegram.png" className="w-12" />
        </div>
    ]

    return <section className="px-12 pt-3 pb-10  grid md:grid-cols-2">
        <div className="flex justify-center items-center flex-col">

            <GradientText colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false} className="text-5xl">IA - n8n</GradientText>

            <div className="pt-2 flex justify-center">
                <DecryptedText speed={30} maxIterations={10} text={experience} animateOn="view" className="font-bold" />
            </div>

            <div style={{ height: '200px', position: 'relative', marginTop: '120px' }}>
                <Folder size={2} color="#7df9ff" className="custom-folder" items={folderItems} 
                />
            </div>
        </div>
        <div className="flex justify-center items-center">
            <ElectricBorder
                color="#7df9ff"
                speed={1}
                chaos={0.12}
                style={{ borderRadius: 50 }}
            >
                <img src="./n8n.png" className="w-72 p-7" />
            </ElectricBorder>

        </div>
    </section>
}

export default IA;