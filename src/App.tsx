// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useEffect } from 'react'
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import './App.css'
import About from './components/About/About'
import Experience from './components/Experience/Experience'
import Header from './components/Header/Header'
import Scroller from './components/Scroller/Scroller'
import IA from './components/IA/IA';

function App() {

  useEffect(() => {
    createChat({
      i18n: {
        en: {
          title: 'Hi! 👋',
          subtitle: "Start a chat",
          footer: '',
          getStarted: 'New Conversation',
          inputPlaceholder: 'Type your question..',
          closeButtonTooltip: ""
        },
        es: {
          title: 'Hey! 👋',
          subtitle: "Inicia una nueva conversación",
          footer: '',
          getStarted: 'Nueva conversación',
          inputPlaceholder: 'Escribe aquí...',
          closeButtonTooltip: ""
        },

      },
      initialMessages: [
        "¡Hola! Soy Asuna, la asistente de Gian :)",
        "Pregúntame lo que quieras sobre él; si quieres mandarle algún mensaje, me lo puedes decir y yo lo enviaré directo a su Telegram."
      ],
      webhookUrl: 'https://n8n.oh-taku.site/webhook/788c0a7f-745c-40b4-9f15-4a8238755a5a/chat'
    });
  }, []);

  return (
    <main className='relative'>
      <Scroller />
      <Header />
      <About />
      <Experience />
      <IA />
    </main>
  )
}

export default App
