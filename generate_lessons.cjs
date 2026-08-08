const fs = require('fs');

const lessonsData = [
  {
    id: 'lesson-1',
    title: 'Identity, Experience and Professional Growth',
    subtitle: 'Speak about who you are without sounding basic or rehearsed.',
    image: '/src/assets/images/lesson_1_growth_1786043310723.jpg',
    text: "When I first entered the workforce, I assumed that competence meant having all the answers. In reality, I had to grow into roles that demanded patience, judgment and the ability to communicate under pressure. I gradually took on responsibilities that were outside my comfort zone, and although the learning curve was steep, those experiences helped me build up transferable skills that still shape the way I work today.\n\nWhen I look back on that period, what stands out is not a single achievement but the sustained effort behind it. I learned that credibility comes from being consistent, admitting what you do not know and following through on what you promise. Once I began to find my feet, I also became more willing to ask for feedback and reflect on my underlying strengths. That self-awareness helped me stand out without pretending to be someone I was not.\n\nWhat I have come to realize is that professional growth is less about collecting impressive titles than about becoming more articulate, adaptable and useful to others. Every demanding experience can broaden your perspective, provided that you learn from it and move forward with a clearer sense of your long-term potential.",
    memoryMap: ['FIRST ROLE', 'RESPONSIBILITY', 'FEEDBACK', 'IDENTITY', 'FUTURE'],
    vocabulary: [
      { expression: 'grow into', meaning: 'convertirse gradualmente en / adaptarse a', microExample: 'I grew into the role over time.', microExampleTranslation: 'Con el tiempo me adapté al cargo.' },
      { expression: 'take on', meaning: 'asumir una responsabilidad o reto', microExample: 'She took on a demanding project.', microExampleTranslation: 'Ella asumió un proyecto exigente.' },
      { expression: 'look back on', meaning: 'recordar y reflexionar sobre el pasado', microExample: 'I look back on that period with gratitude.', microExampleTranslation: 'Recuerdo esa etapa con gratitud.' },
      { expression: 'follow through on', meaning: 'cumplir o llevar hasta el final lo prometido', microExample: 'Credibility depends on following through on promises.', microExampleTranslation: 'La credibilidad depende de cumplir las promesas hasta el final.' },
      { expression: 'build up', meaning: 'desarrollar o acumular gradualmente', microExample: 'He built up valuable experience.', microExampleTranslation: 'Él acumuló experiencia valiosa.' },
      { expression: 'stand out', meaning: 'destacarse', microExample: 'Her ability to listen made her stand out.', microExampleTranslation: 'Su capacidad de escuchar la hizo destacar.' },
      { expression: 'move forward', meaning: 'avanzar después de una situación', microExample: 'We learned from it and moved forward.', microExampleTranslation: 'Aprendimos de eso y seguimos adelante.' },
      { expression: 'find your feet', meaning: 'adaptarse y comenzar a sentirse seguro', microExample: 'It took me a few weeks to find my feet.', microExampleTranslation: 'Me tomó unas semanas adaptarme y sentirme seguro.' },
      { expression: 'a steep learning curve', meaning: 'un proceso de aprendizaje rápido y difícil', microExample: 'Managing a team was a steep learning curve.', microExampleTranslation: 'Dirigir un equipo fue un aprendizaje intenso y exigente.' }
    ],
    collocations: ['professional trajectory', 'transferable skills', 'self-awareness', 'professional identity', 'underlying strengths', 'sustained effort', 'credible', 'articulate', 'broaden my perspective', 'long-term potential'],
    structures: ['What I have come to realize is that...', 'It was only when ___ that I understood ___.', 'Not only did I ___, but I also ___.']
  },
  {
    id: 'lesson-2',
    title: 'Setbacks, Resilience and Recovery',
    subtitle: 'Explain difficulties with maturity instead of using simple problem-solution language.',
    image: 'defaultImage',
    text: "Whenever I face a setback, my first reaction is not always productive. I may want to avoid the situation, blame external circumstances or rush into a solution. Yet difficult problems rarely disappear on their own. To deal with them effectively, I need to step back, identify the underlying cause and divide the situation into manageable parts.\n\nThis does not mean that disappointment can be switched off immediately. Some experiences take time to get over, particularly when considerable effort has been invested. However, I have learned to work through frustration instead of allowing it to shape every decision. Constructive feedback can be uncomfortable, but it often reveals the adjustment needed to turn around a negative situation.\n\nIn hindsight, a few of my most discouraging moments were a blessing in disguise. They forced me to reconsider unrealistic expectations, strengthen my emotional composure and learn from mistakes that success might have hidden. Resilience is not the ability to avoid failure; it is the capacity to bounce back, regain momentum and get back on track without repeating the same pattern. No matter how adverse the circumstances may seem, a setback can become a learning opportunity when it leads to a more thoughtful response.",
    memoryMap: ['SETBACK', 'CAUSE', 'RESPONSE', 'LESSON', 'RECOVERY'],
    vocabulary: [
      { expression: 'deal with', meaning: 'manejar o enfrentar una situación', microExample: 'We dealt with the issue calmly.', microExampleTranslation: 'Manejamos el problema con calma.' },
      { expression: 'rush into', meaning: 'precipitarse a hacer algo sin pensarlo bien', microExample: 'Do not rush into a decision under pressure.', microExampleTranslation: 'No te precipites a tomar una decisión bajo presión.' },
      { expression: 'step back', meaning: 'tomar distancia para ver una situación con más claridad', microExample: 'I stepped back and looked at the problem calmly.', microExampleTranslation: 'Tomé distancia y miré el problema con calma.' },
      { expression: 'bounce back', meaning: 'recuperarse después de una dificultad', microExample: 'She bounced back after the rejection.', microExampleTranslation: 'Ella se recuperó después del rechazo.' },
      { expression: 'work through', meaning: 'resolver algo paso a paso', microExample: 'We worked through the problem together.', microExampleTranslation: 'Resolvimos el problema paso a paso.' },
      { expression: 'get over', meaning: 'superar emocionalmente o recuperarse', microExample: 'It took time to get over the disappointment.', microExampleTranslation: 'Tomó tiempo superar la decepción.' },
      { expression: 'switch off', meaning: 'apagarse o desconectarse mental o emocionalmente', microExample: 'It is hard to switch off after a stressful day.', microExampleTranslation: 'Es difícil desconectarse después de un día estresante.' },
      { expression: 'turn around', meaning: 'cambiar una situación negativa', microExample: 'The new plan turned the situation around.', microExampleTranslation: 'El nuevo plan cambió la situación por completo.' },
      { expression: 'learn from', meaning: 'aprender a partir de una experiencia', microExample: 'Strong teams learn from their mistakes.', microExampleTranslation: 'Los equipos sólidos aprenden de sus errores.' },
      { expression: 'a blessing in disguise', meaning: 'algo negativo que termina produciendo un beneficio', microExample: 'Losing that opportunity was a blessing in disguise.', microExampleTranslation: 'Perder esa oportunidad terminó siendo algo positivo.' },
      { expression: 'get back on track', meaning: 'retomar el rumbo correcto', microExample: 'The review helped us get back on track.', microExampleTranslation: 'La revisión nos ayudó a retomar el rumbo.' }
    ],
    collocations: ['setback', 'resilience', 'counterproductive', 'underlying cause', 'manageable', 'regain momentum', 'constructive feedback', 'adverse circumstances', 'learning opportunity', 'emotional composure'],
    structures: ['Had I ___, I would have ___.', 'Rather than ___, I chose to ___.', 'No matter how ___, ___.']
  },
  {
    id: 'lesson-3',
    title: 'Decisions Under Uncertainty',
    subtitle: 'Compare options, acknowledge risk and justify a decision precisely.',
    image: 'defaultImage',
    text: "Making a difficult decision is rarely a matter of choosing between a clearly good option and a clearly bad one. More often, we have to weigh up competing priorities, incomplete information and potential drawbacks. A choice may be financially feasible but emotionally demanding, or personally attractive but likely to have far-reaching consequences for other people.\n\nBefore I go ahead with an important plan, I try to think through what could reasonably go wrong. This does not mean imagining every possible disaster. It means identifying the most relevant risks, deciding which ones can be reduced and determining whether an alternative course of action exists. I may rule out an option because the evidence against it is compelling, hold off until more information becomes available or fall back on a simpler plan if conditions change.\n\nThere is also a point at which endless analysis becomes another form of avoidance. You cannot sit on the fence forever and still expect progress. Sound judgment requires both caution and the willingness to take the plunge once the likely trade-offs are understood. An informed decision is not one that guarantees a perfect outcome; it is one made deliberately, with a clear rationale and an honest awareness of possible unintended consequences.",
    memoryMap: ['OPTIONS', 'TRADE-OFFS', 'RISK', 'DECISION', 'BACKUP'],
    vocabulary: [
      { expression: 'weigh up', meaning: 'evaluar ventajas y desventajas', microExample: 'We weighed up the available options.', microExampleTranslation: 'Evaluamos las opciones disponibles.' },
      { expression: 'rule out', meaning: 'descartar una posibilidad', microExample: 'We cannot rule out further delays.', microExampleTranslation: 'No podemos descartar más retrasos.' },
      { expression: 'go ahead with', meaning: 'proceder con un plan', microExample: 'They went ahead with the proposal.', microExampleTranslation: 'Siguieron adelante con la propuesta.' },
      { expression: 'think through', meaning: 'analizar cuidadosamente', microExample: 'Think the consequences through first.', microExampleTranslation: 'Analiza bien las consecuencias primero.' },
      { expression: 'go wrong', meaning: 'salir mal o fallar', microExample: 'We considered what could go wrong.', microExampleTranslation: 'Consideramos qué podría salir mal.' },
      { expression: 'fall back on', meaning: 'recurrir a una alternativa de respaldo', microExample: 'We can fall back on the original plan.', microExampleTranslation: 'Podemos recurrir al plan original.' },
      { expression: 'hold off', meaning: 'esperar antes de actuar', microExample: 'I decided to hold off until Friday.', microExampleTranslation: 'Decidí esperar hasta el viernes.' },
      { expression: 'sit on the fence', meaning: 'evitar tomar una posición o decisión', microExample: 'You cannot sit on the fence forever.', microExampleTranslation: 'No puedes evitar decidir para siempre.' },
      { expression: 'take the plunge', meaning: 'decidirse a hacer algo importante o arriesgado', microExample: 'After months of planning, she took the plunge.', microExampleTranslation: 'Después de meses de planeación, finalmente se decidió.' }
    ],
    collocations: ['trade-off', 'feasible', 'compelling', 'far-reaching', 'informed decision', 'uncertainty', 'potential drawback', 'alternative course of action', 'sound judgment', 'unintended consequences'],
    structures: ['Much as I would like to ___, ___.', 'The more carefully we ___, the less likely we are to ___.', 'Were I to ___, I would ___.']
  },
  {
    id: 'lesson-4',
    title: 'Leadership and Accountability',
    subtitle: 'Discuss leadership as behavior, not merely authority.',
    image: 'defaultImage',
    text: "Leadership becomes visible when circumstances are demanding and someone has to step up. A title may provide authority, but it does not automatically create trust. People are more likely to follow a leader who communicates transparently, behaves consistently and is willing to take ownership when results fall short.\n\nEffective leaders set out priorities clearly and align expectations before work begins. They know when to hand over responsibility, yet they do not abandon strategic oversight. Delegating effectively is not simply passing work to someone else; it is providing context, resources and a realistic standard. When a new person takes over a task, the leader should remain available without controlling every detail.\n\nThe strongest leaders also bring out qualities that people may not recognize in themselves. They address underperformance directly but respectfully, and they follow through on both promises and difficult decisions. Above all, they lead by example. They cannot demand accountability while avoiding it themselves. When leaders foster trust, team members are more willing to go the extra mile, speak honestly about risks and accept collective responsibility for the outcome. Leadership, therefore, is not a performance of confidence; it is the daily practice of creating clarity, enabling others and remaining answerable for what happens next.",
    memoryMap: ['DIRECTION', 'EXAMPLE', 'DELEGATION', 'FEEDBACK', 'OWNERSHIP'],
    vocabulary: [
      { expression: 'step up', meaning: 'asumir responsabilidad cuando se necesita', microExample: 'She stepped up during the crisis.', microExampleTranslation: 'Ella asumió la responsabilidad durante la crisis.' },
      { expression: 'follow through on', meaning: 'cumplir completamente lo prometido', microExample: 'Good leaders follow through on commitments.', microExampleTranslation: 'Los buenos líderes cumplen sus compromisos.' },
      { expression: 'take ownership', meaning: 'asumir plena responsabilidad', microExample: 'Strong leaders take ownership when results fall short.', microExampleTranslation: 'Los líderes sólidos asumen plena responsabilidad cuando los resultados se quedan cortos.' },
      { expression: 'fall short', meaning: 'quedarse corto o no alcanzar lo esperado', microExample: 'The results fell short of expectations.', microExampleTranslation: 'Los resultados se quedaron cortos frente a las expectativas.' },
      { expression: 'hand over', meaning: 'entregar responsabilidad o control', microExample: 'He handed the task over to his colleague.', microExampleTranslation: 'Él le entregó la tarea a su colega.' },
      { expression: 'bring out', meaning: 'hacer que una cualidad aparezca', microExample: 'The coach brought out the best in the team.', microExampleTranslation: 'El entrenador sacó lo mejor del equipo.' },
      { expression: 'set out', meaning: 'explicar o presentar claramente un plan', microExample: 'She set out the priorities clearly.', microExampleTranslation: 'Ella expuso claramente las prioridades.' },
      { expression: 'take over', meaning: 'asumir control o responsabilidad', microExample: 'I took over the project in May.', microExampleTranslation: 'Asumí el proyecto en mayo.' },
      { expression: 'lead by example', meaning: 'guiar mediante la propia conducta', microExample: 'Managers should lead by example.', microExampleTranslation: 'Los gerentes deben liderar con el ejemplo.' },
      { expression: 'go the extra mile', meaning: 'hacer un esfuerzo adicional', microExample: 'The team went the extra mile for the client.', microExampleTranslation: 'El equipo hizo un esfuerzo adicional por el cliente.' }
    ],
    collocations: ['accountability', 'delegate effectively', 'align expectations', 'foster trust', 'address underperformance', 'take ownership', 'transparent', 'consistent', 'strategic oversight', 'collective responsibility'],
    structures: ['A leader is not someone who ___, but someone who ___.', 'Unless expectations are ___, ___.', 'By ___ing, we can ___.']
  },
  {
    id: 'lesson-5',
    title: 'Disagreeing Without Creating Conflict',
    subtitle: 'Challenge ideas while preserving respect and cooperation.',
    image: 'defaultImage',
    text: "Disagreement does not have to damage a relationship. In fact, a respectful objection can improve a decision by revealing assumptions that nobody has examined. The difficulty is learning how to bring up a concern without making the other person feel attacked. Before I challenge an idea, I try to acknowledge any valid point it contains and clarify the intention behind my response.\n\nI may point out that the evidence is incomplete, but I should also explain why that matters. Simply saying \"I disagree\" rarely gets across a nuanced position. A more diplomatic approach is to distinguish the person from the proposal: \"I can see where you are coming from; however, I am not convinced that this solution addresses the underlying issue.\"\n\nThere are moments when we need to speak up, especially if silence could lead to a poor outcome. Nevertheless, constructive disagreement is not about refusing to back down at any cost. Two people may never see eye to eye, yet they can still identify common ground, meet each other halfway and clear up a misinterpretation. What matters is not winning the exchange but ensuring that the final decision is well-founded, understood and workable for everyone involved.",
    memoryMap: ['ACKNOWLEDGE', 'CLARIFY', 'CHALLENGE', 'EVIDENCE', 'COMMON GROUND'],
    vocabulary: [
      { expression: 'bring up', meaning: 'mencionar un tema', microExample: 'She brought up an important concern.', microExampleTranslation: 'Ella mencionó una preocupación importante.' },
      { expression: 'point out', meaning: 'señalar o hacer notar', microExample: 'He pointed out a flaw in the plan.', microExampleTranslation: 'Él señaló una falla en el plan.' },
      { expression: 'get across', meaning: 'comunicar una idea con éxito', microExample: 'I struggled to get my point across.', microExampleTranslation: 'Me costó comunicar mi idea.' },
      { expression: 'back down', meaning: 'ceder o retirar una posición', microExample: 'Neither side was willing to back down.', microExampleTranslation: 'Ninguna parte estaba dispuesta a ceder.' },
      { expression: 'speak up', meaning: 'expresar una opinión con firmeza', microExample: 'You should speak up if something is unsafe.', microExampleTranslation: 'Debes expresar tu opinión si algo no es seguro.' },
      { expression: 'clear up', meaning: 'aclarar una confusión', microExample: 'The meeting cleared up the misunderstanding.', microExampleTranslation: 'La reunión aclaró el malentendido.' },
      { expression: 'see eye to eye', meaning: 'estar completamente de acuerdo', microExample: 'We do not always see eye to eye.', microExampleTranslation: 'No siempre estamos de acuerdo.' },
      { expression: 'meet someone halfway', meaning: 'ceder parcialmente para llegar a un acuerdo', microExample: 'Both sides need to meet halfway.', microExampleTranslation: 'Ambas partes deben ceder un poco.' }
    ],
    collocations: ['acknowledge a valid point', 'respectfully challenge', 'nuanced', 'assumption', 'clarify intent', 'common ground', 'diplomatic', 'constructive disagreement', 'misinterpretation', 'well-founded'],
    structures: ['While it may be true that ___, ___.', 'What matters is not ___, but ___.', 'I can see where you are coming from, yet ___.']
  },
  {
    id: 'lesson-6',
    title: 'Technology: Convenience or Dependence?',
    subtitle: 'Develop a balanced argument about a familiar but complex topic.',
    image: 'defaultImage',
    text: "Modern technology has made daily life remarkably convenient. Information is at our fingertips, routine processes are increasingly seamless and many people can work or study from almost anywhere. At the same time, the more we rely on digital tools, the easier it becomes to overlook the dependency they create.\n\nTechnology is often a double-edged sword. A notification may help us keep up with an urgent task, yet constant interruptions can produce cognitive overload. A personalized service may improve efficiency, while the data required to personalize it raises serious questions about privacy and ethical implications. Users should be able to opt out of unnecessary data collection, and organizations should phase out intrusive practices rather than treating consent as a formality.\n\nOn a personal level, digital literacy includes knowing when to connect and when to switch off. I may need to cut down on passive screen time, protect periods of uninterrupted attention and develop sustainable habits instead of depending on willpower alone. Whether technology improves our lives depends largely on whether it supports deliberate choices or quietly replaces them. Convenience is valuable, but it should not come at the cost of autonomy, concentration or meaningful human interaction.",
    memoryMap: ['CONVENIENCE', 'COST', 'PRIVACY', 'HABITS', 'BALANCE'],
    vocabulary: [
      { expression: 'rely on', meaning: 'depender de', microExample: 'We rely on technology every day.', microExampleTranslation: 'Dependemos de la tecnología todos los días.' },
      { expression: 'cut down on', meaning: 'reducir el consumo o uso', microExample: 'I am trying to cut down on screen time.', microExampleTranslation: 'Estoy intentando reducir el tiempo de pantalla.' },
      { expression: 'keep up with', meaning: 'mantenerse al día con', microExample: 'It is hard to keep up with every update.', microExampleTranslation: 'Es difícil mantenerse al día con cada actualización.' },
      { expression: 'phase out', meaning: 'eliminar gradualmente', microExample: 'The company phased out the old system.', microExampleTranslation: 'La empresa eliminó gradualmente el sistema antiguo.' },
      { expression: 'switch off', meaning: 'desconectarse o apagar', microExample: 'I switch off notifications after work.', microExampleTranslation: 'Desactivo las notificaciones después del trabajo.' },
      { expression: 'opt out of', meaning: 'decidir no participar', microExample: 'Users can opt out of data collection.', microExampleTranslation: 'Los usuarios pueden decidir no participar en la recolección de datos.' },
      { expression: 'a double-edged sword', meaning: 'algo con ventajas y desventajas', microExample: 'Automation can be a double-edged sword.', microExampleTranslation: 'La automatización puede tener beneficios y riesgos.' },
      { expression: 'at your fingertips', meaning: 'disponible de inmediato', microExample: 'A vast amount of information is at our fingertips.', microExampleTranslation: 'Tenemos una enorme cantidad de información al alcance.' }
    ],
    collocations: ['convenience', 'dependency', 'data privacy', 'cognitive overload', 'seamless', 'intrusive', 'efficiency', 'ethical implications', 'digital literacy', 'sustainable habits'],
    structures: ['The extent to which ___ depends on ___.', 'Not until I ___ did I realize ___.', 'Whether ___ is beneficial depends largely on ___.']
  },
  {
    id: 'lesson-7',
    title: 'How Advanced Learning Actually Works',
    subtitle: 'Describe learning processes with precise, reusable language.',
    image: 'defaultImage',
    text: "People often assume that repeated exposure automatically leads to mastery. They may read the same page several times, go over a list of words or listen to hours of English without checking what they can actually retrieve. Passive exposure is useful, but it does not guarantee retention.\n\nEffective learning requires a feedback loop. First, we need contextualized input that is challenging but understandable. Then we must take in the meaning, notice how expressions work together and test whether we can recall them without looking. We may pick up useful language naturally, but deliberate practice is what helps us put it into practice with accuracy.\n\nWhen progress slows, learners often believe they have reached a permanent plateau. In reality, they may simply need to brush up on weak areas, vary the task or increase the difficulty. The goal is not to repeat one paragraph forever. It is to reconstruct it, personalize it and use its structures in unfamiliar situations. If we keep at this process, advanced patterns gradually become second nature. We no longer have to assemble every sentence word by word because well-practiced combinations are available as complete units. That is how active recall can consolidate knowledge and turn memorized language into flexible speaking ability.",
    memoryMap: ['INPUT', 'UNDERSTAND', 'RECALL', 'TRANSFORM', 'PERFORM'],
    vocabulary: [
      { expression: 'pick up', meaning: 'aprender de manera informal', microExample: 'I picked up the expression from a podcast.', microExampleTranslation: 'Aprendí la expresión escuchando un pódcast.' },
      { expression: 'brush up on', meaning: 'repasar una habilidad que ya se tenía', microExample: 'I need to brush up on my grammar.', microExampleTranslation: 'Necesito repasar mi gramática.' },
      { expression: 'take in', meaning: 'comprender y asimilar información', microExample: 'There was too much information to take in.', microExampleTranslation: 'Había demasiada información para asimilar.' },
      { expression: 'go over', meaning: 'revisar de nuevo', microExample: 'Let us go over the main points.', microExampleTranslation: 'Revisemos nuevamente los puntos principales.' },
      { expression: 'put into practice', meaning: 'poner en práctica', microExample: 'You must put the new vocabulary into practice.', microExampleTranslation: 'Debes poner en práctica el vocabulario nuevo.' },
      { expression: 'keep at', meaning: 'continuar a pesar de la dificultad', microExample: 'Keep at it even when progress feels slow.', microExampleTranslation: 'Continúa aunque el progreso parezca lento.' },
      { expression: 'learn the ropes', meaning: 'aprender cómo funciona una actividad', microExample: 'It took time to learn the ropes.', microExampleTranslation: 'Tomó tiempo aprender cómo funcionaba todo.' },
      { expression: 'become second nature', meaning: 'volverse automático y natural', microExample: 'With practice, the structure became second nature.', microExampleTranslation: 'Con práctica, la estructura se volvió natural.' }
    ],
    collocations: ['retention', 'deliberate practice', 'retrieve information', 'consolidate knowledge', 'passive exposure', 'measurable progress', 'learning plateau', 'feedback loop', 'contextualized input', 'active recall'],
    structures: ['The reason why ___ is that ___.', 'Having ___, I was able to ___.', 'It is through ___ that we ___.']
  },
  {
    id: 'lesson-8',
    title: 'Why Communication Breaks Down',
    subtitle: 'Analyze misunderstandings beyond "I did not understand."',
    image: 'defaultImage',
    text: "Communication usually breaks down not because people lack intelligence, but because they make different assumptions about the same message. One person may leave out information that seems obvious to them, while another may read into a brief reply and interpret an unintended tone. By the time both sides realize that they have got their wires crossed, frustration may already have replaced curiosity.\n\nClear communication is more than being concise. A message can be short yet ambiguous, detailed yet incoherent or technically accurate while failing to get through to the intended audience. When priorities conflict, people may also focus on different parts of the same conversation. One is thinking about speed; the other is concerned about quality or risk.\n\nThe most reliable response is to clarify rather than guess. I can reach out and ask what outcome is expected, summarize my understanding or suggest that we talk the issue over before acting. Sometimes we need to read between the lines, but implicit meaning should not replace explicit agreement when the consequences matter. Only by checking assumptions, clarifying expectations and paying attention to tone can we close a communication gap and build mutual understanding.",
    memoryMap: ['MESSAGE', 'ASSUMPTION', 'TONE', 'CLARIFICATION', 'AGREEMENT'],
    vocabulary: [
      { expression: 'break down', meaning: 'dejar de funcionar; fracasar la comunicación', microExample: 'Communication broke down under pressure.', microExampleTranslation: 'La comunicación falló bajo presión.' },
      { expression: 'leave out', meaning: 'omitir información', microExample: 'Do not leave out the key details.', microExampleTranslation: 'No omitas los detalles clave.' },
      { expression: 'read into', meaning: 'interpretar más de lo que realmente se dijo', microExample: 'You may be reading too much into the message.', microExampleTranslation: 'Tal vez estás interpretando demasiado el mensaje.' },
      { expression: 'talk over', meaning: 'conversar para analizar un problema', microExample: 'We should talk the issue over.', microExampleTranslation: 'Deberíamos conversar para analizar el problema.' },
      { expression: 'reach out', meaning: 'contactar a alguien', microExample: 'I reached out to clarify the request.', microExampleTranslation: 'Me comuniqué para aclarar la solicitud.' },
      { expression: 'get through to', meaning: 'lograr que alguien comprenda', microExample: 'I could not get through to him.', microExampleTranslation: 'No logré hacerle entender mi punto.' },
      { expression: 'read between the lines', meaning: 'entender un significado implícito', microExample: 'You have to read between the lines.', microExampleTranslation: 'Hay que entender lo que se insinúa.' },
      { expression: 'get your wires crossed', meaning: 'confundirse por un malentendido', microExample: 'We got our wires crossed about the deadline.', microExampleTranslation: 'Nos confundimos con respecto a la fecha límite.' }
    ],
    collocations: ['ambiguity', 'communication gap', 'implicit meaning', 'conflicting priorities', 'concise', 'coherent', 'misalignment', 'clarify expectations', 'mutual understanding', 'unintended tone'],
    structures: ['What may sound ___ can be interpreted as ___.', 'If something is left unclear, ___.', 'Only by ___ing can we ___.']
  },
  {
    id: 'lesson-9',
    title: 'Time, Priorities and Sustainable Performance',
    subtitle: 'Talk about productivity without reducing it to "being busy."',
    image: 'defaultImage',
    text: "Being busy and being effective are not the same thing. When several demands compete for attention, I may put off the most difficult task and spend the day responding to minor requests. This creates the illusion of progress, but the important work remains on the back burner until I begin to run out of time.\n\nTo prioritize effectively, I need to distinguish between what is urgent and what is important. I set aside periods for focused work, cut back on activities that add little value and decide what can reasonably wait. A realistic workload also protects mental bandwidth. There is little point in completing more tasks today if exhaustion makes tomorrow's decisions worse.\n\nSustainable performance includes deliberate rest. When people constantly burn the candle at both ends, effort eventually produces diminishing returns. I may need to wind down without screens, sleep properly or leave enough space to think before the next demanding period. Catching up is sometimes necessary, but repeatedly using personal time to catch up on unfinished work is usually a sign that the system needs to change. Good time allocation is not about controlling every minute; it is about giving attention to what matters while maintaining a pace that can continue.",
    memoryMap: ['DEMANDS', 'PRIORITY', 'FOCUS', 'REST', 'REVIEW'],
    vocabulary: [
      { expression: 'put off', meaning: 'posponer', microExample: 'I kept putting off the difficult task.', microExampleTranslation: 'Seguí posponiendo la tarea difícil.' },
      { expression: 'catch up on', meaning: 'ponerse al día con', microExample: 'I used Saturday to catch up on emails.', microExampleTranslation: 'Usé el sábado para ponerme al día con los correos.' },
      { expression: 'run out of', meaning: 'quedarse sin', microExample: 'We ran out of time before the deadline.', microExampleTranslation: 'Nos quedamos sin tiempo antes de la fecha límite.' },
      { expression: 'set aside', meaning: 'reservar tiempo o recursos', microExample: 'Set aside an hour for focused work.', microExampleTranslation: 'Reserva una hora para trabajar con concentración.' },
      { expression: 'cut back on', meaning: 'reducir', microExample: 'I cut back on unnecessary meetings.', microExampleTranslation: 'Reduje las reuniones innecesarias.' },
      { expression: 'wind down', meaning: 'relajarse gradualmente', microExample: 'I need time to wind down in the evening.', microExampleTranslation: 'Necesito tiempo para relajarme en la noche.' },
      { expression: 'burn the candle at both ends', meaning: 'exigirse demasiado sin descansar', microExample: 'You cannot burn the candle at both ends indefinitely.', microExampleTranslation: 'No puedes exigirte al máximo sin descansar indefinidamente.' },
      { expression: 'put something on the back burner', meaning: 'dejar algo temporalmente en segundo plano', microExample: 'We put the redesign on the back burner.', microExampleTranslation: 'Dejamos el rediseño temporalmente en segundo plano.' }
    ],
    collocations: ['competing demands', 'prioritize effectively', 'mental bandwidth', 'sustainable pace', 'urgent versus important', 'realistic workload', 'deliberate rest', 'productivity trap', 'time allocation', 'diminishing returns'],
    structures: ['There is little point in ___ing if ___.', 'Even if ___, it does not necessarily mean ___.', 'The sooner we ___, the easier it becomes to ___.']
  },
  {
    id: 'lesson-10',
    title: 'Change, Adaptability and Reinvention',
    subtitle: 'Explain how change happens and why people resist it.',
    image: 'defaultImage',
    text: "Change can come about gradually or arrive suddenly enough to shake up an entire routine. In either case, resistance is natural. People are not always rejecting the new idea itself; they may be reacting to uncertainty, a loss of control or the fear that their existing skills will no longer be valued.\n\nSustainable change requires more than announcing a strategic shift. Leaders need to explain why it matters, provide support during the transition and allow people to settle into new expectations. Incremental change may be slower, but it often produces stronger commitment than forcing everyone to adjust at once. Once people understand the purpose and see measurable progress, they become more willing to let go of outdated assumptions.\n\nAdaptability also matters at an individual level. A person may branch out into a new field, turn over a new leaf or deliberately move out of their comfort zone. These choices can bring about valuable growth, provided that risk is managed rather than ignored. A flexible mindset does not mean accepting every trend. It means evaluating emerging opportunities, learning what the situation requires and adjusting without losing sight of long-term viability.",
    memoryMap: ['TRIGGER', 'RESISTANCE', 'TRANSITION', 'ADAPTATION', 'OPPORTUNITY'],
    vocabulary: [
      { expression: 'come about', meaning: 'ocurrir o surgir', microExample: 'How did the change come about?', microExampleTranslation: '¿Cómo surgió el cambio?' },
      { expression: 'bring about', meaning: 'provocar un cambio', microExample: 'The policy brought about major improvements.', microExampleTranslation: 'La política produjo mejoras importantes.' },
      { expression: 'shake up', meaning: 'cambiar drásticamente una situación', microExample: 'The new technology shook up the industry.', microExampleTranslation: 'La nueva tecnología transformó la industria.' },
      { expression: 'settle into', meaning: 'adaptarse gradualmente a una situación', microExample: 'I settled into the new routine.', microExampleTranslation: 'Me adapté a la nueva rutina.' },
      { expression: 'branch out', meaning: 'ampliarse hacia nuevas áreas', microExample: 'The company branched out into training.', microExampleTranslation: 'La empresa se expandió hacia la capacitación.' },
      { expression: 'let go of', meaning: 'dejar atrás o soltar', microExample: 'We need to let go of outdated assumptions.', microExampleTranslation: 'Debemos dejar atrás suposiciones anticuadas.' },
      { expression: 'turn over a new leaf', meaning: 'comenzar de nuevo con mejores hábitos', microExample: 'He decided to turn over a new leaf.', microExampleTranslation: 'Decidió comenzar una nueva etapa con mejores hábitos.' },
      { expression: 'out of your comfort zone', meaning: 'fuera de lo conocido y cómodo', microExample: 'Growth often happens outside your comfort zone.', microExampleTranslation: 'El crecimiento suele ocurrir fuera de la zona de confort.' }
    ],
    collocations: ['adaptability', 'resistance', 'transition', 'incremental change', 'organizational culture', 'emerging opportunity', 'flexible mindset', 'long-term viability', 'strategic shift', 'uncertainty tolerance'],
    structures: ['Change rarely happens because ___ alone.', 'Far from being ___, it can be ___.', 'Once people begin to ___, ___.']
  },
  {
    id: 'lesson-11',
    title: 'Information, Evidence and Critical Thinking',
    subtitle: 'Evaluate claims without sounding either naïve or cynical.',
    image: 'defaultImage',
    text: "In an environment where information travels quickly, it is tempting to take a claim at face value, especially when it confirms what we already believe. Critical thinking begins when we slow down and look into the source, the evidence and the context in which the claim was made.\n\nA credible source does not make every statement automatically correct, just as an unfamiliar source is not necessarily wrong. We need to sift through the available material, distinguish fact from opinion and ask whether important details have been left out. A chart may look authoritative while using a misleading scale, and a quotation may be accurate but stripped of the context needed to make out its original meaning.\n\nWe should call out misinformation when the evidence is clear, but we should also avoid turning uncertainty into an accusation that someone is trying to cover up the truth. What appears to be deliberate deception may be poor analysis, oversimplification or an honest mistake. Often, the issue boils down to whether the conclusion is well-substantiated and whether reasonable alternatives have been considered. A dramatic headline may be only the tip of the iceberg, but it may also exaggerate a minor issue. Information literacy is the ability to tell the difference.",
    memoryMap: ['CLAIM', 'SOURCE', 'EVIDENCE', 'CONTEXT', 'CONCLUSION'],
    vocabulary: [
      { expression: 'look into', meaning: 'investigar', microExample: 'We need to look into the claim.', microExampleTranslation: 'Necesitamos investigar la afirmación.' },
      { expression: 'make out', meaning: 'distinguir o comprender con dificultad', microExample: 'I could not make out the source in the image.', microExampleTranslation: 'No pude distinguir la fuente en la imagen.' },
      { expression: 'sift through', meaning: 'revisar mucha información cuidadosamente', microExample: 'She sifted through the available evidence.', microExampleTranslation: 'Ella revisó cuidadosamente la evidencia disponible.' },
      { expression: 'call out', meaning: 'señalar públicamente algo incorrecto', microExample: 'Experts called out the misleading statistic.', microExampleTranslation: 'Los expertos señalaron la estadística engañosa.' },
      { expression: 'cover up', meaning: 'ocultar deliberadamente', microExample: 'The report exposed an attempt to cover up the error.', microExampleTranslation: 'El informe reveló un intento de ocultar el error.' },
      { expression: 'boil down to', meaning: 'reducirse esencialmente a', microExample: 'The debate boils down to trust.', microExampleTranslation: 'El debate se reduce esencialmente a la confianza.' },
      { expression: 'take something at face value', meaning: 'aceptar algo sin cuestionarlo', microExample: 'Do not take the headline at face value.', microExampleTranslation: 'No aceptes el titular sin cuestionarlo.' },
      { expression: 'the tip of the iceberg', meaning: 'una pequeña parte de un problema mayor', microExample: 'The visible errors were only the tip of the iceberg.', microExampleTranslation: 'Los errores visibles eran solo una pequeña parte del problema.' }
    ],
    collocations: ['credible source', 'misleading claim', 'confirmation bias', 'verify evidence', 'context', 'oversimplification', 'well-substantiated', 'distinguish fact from opinion', 'information literacy', 'reasonable inference'],
    structures: ['Just because ___ does not mean ___.', 'The claim that ___ overlooks ___.', 'What appears to be ___ may in fact be ___.']
  },
  {
    id: 'lesson-12',
    title: 'Success, Values and Long-Term Direction',
    subtitle: 'End with an adaptable framework for abstract and personal questions.',
    image: 'defaultImage',
    text: "Success is often measured through visible achievements: income, recognition, qualifications or status. These outcomes may be meaningful, but they do not automatically create fulfillment. If our goals are based entirely on external validation, even impressive results may fail to live up to our expectations.\n\nA more sustainable approach is to aim for progress that aligns with personal values. This requires a long-term vision, but it does not mean that every stage can be predicted. We can map out a direction, identify a personal benchmark and still adjust when circumstances change. What matters is the ability to carry on with purpose rather than pursue a fixed image of success at any cost.\n\nMeaningful ambition also includes contribution. Some people want to give back through education, service, leadership or work that improves other people’s options. Others focus on creating something that will stand the test of time. Whatever form it takes, lasting impact usually depends on seeing commitments through. We need enough discipline to see a goal through and enough perspective to recognize when the goal no longer serves the bigger picture. At the end of the day, success is less about appearing accomplished than about building a life whose direction, effort and consequences we can respect.",
    memoryMap: ['DEFINITION', 'VALUES', 'DIRECTION', 'CONTRIBUTION', 'LEGACY'],
    vocabulary: [
      { expression: 'aim for', meaning: 'tener como objetivo', microExample: 'We should aim for steady improvement.', microExampleTranslation: 'Debemos aspirar a una mejora constante.' },
      { expression: 'live up to', meaning: 'estar a la altura de una expectativa', microExample: 'The experience lived up to my expectations.', microExampleTranslation: 'La experiencia estuvo a la altura de mis expectativas.' },
      { expression: 'map out', meaning: 'planificar detalladamente', microExample: 'She mapped out the next stage of her career.', microExampleTranslation: 'Ella trazó la siguiente etapa de su carrera.' },
      { expression: 'carry on', meaning: 'continuar', microExample: 'We carried on despite the uncertainty.', microExampleTranslation: 'Continuamos a pesar de la incertidumbre.' },
      { expression: 'give back', meaning: 'contribuir o devolver a la comunidad', microExample: 'He wants to give back through education.', microExampleTranslation: 'Él quiere contribuir mediante la educación.' },
      { expression: 'see through', meaning: 'llevar algo hasta el final', microExample: 'I intend to see the project through.', microExampleTranslation: 'Tengo la intención de llevar el proyecto hasta el final.' },
      { expression: 'the bigger picture', meaning: 'la visión general', microExample: 'Do not lose sight of the bigger picture.', microExampleTranslation: 'No pierdas de vista la visión general.' },
      { expression: 'stand the test of time', meaning: 'seguir siendo valioso con el paso del tiempo', microExample: 'Good principles stand the test of time.', microExampleTranslation: 'Los buenos principios conservan su valor con el tiempo.' },
      { expression: 'at the end of the day', meaning: 'en definitiva', microExample: 'At the end of the day, the choice is yours.', microExampleTranslation: 'En definitiva, la decisión es tuya.' }
    ],
    collocations: ['fulfillment', 'external validation', 'meaningful contribution', 'personal benchmark', 'long-term vision', 'align with values', 'sustainable ambition', 'define success', 'intrinsic motivation', 'lasting impact'],
    structures: ['Success is less about ___ than about ___.', 'Whatever path we choose, ___.', 'If I were to define ___, I would say ___.']
  }
];

const fileContent = `import { Lesson } from '../types';

const defaultImage = '/icon-512.png';

export const lessons: Lesson[] = ${JSON.stringify(lessonsData, null, 2).replace(/"defaultImage"/g, 'defaultImage')};
`;

fs.writeFileSync('./src/data/lessons.ts', fileContent, 'utf-8');
console.log('Successfully wrote 12 lessons to ./src/data/lessons.ts');
