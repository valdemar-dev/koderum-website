
import { createEventListener, createState } from "elegance-js/server/createState";
import { createLoadHook } from "elegance-js/server/loadHook";
import { observe } from "elegance-js/server/observe";
import { CursorOverlay } from "./components/CursorOverlay";

createLoadHook({
    deps: [],
    fn: (_) => {
        const el = document.getElementById("holo-bar-flash");
        if (el == null) return;

        function pnoise(x: number, seed: number = 0): number {
          const p = Math.floor(x);
          const f = x - p;
          const u = f * f * (3 - 2 * f);

          const a = Math.sin((p + seed) * 12.9898) * 43758.5453123;
          const b = Math.sin((p + 1 + seed) * 12.9898) * 43758.5453123;

          const ga = 2.0 * (a - Math.floor(a)) - 1.0;
          const gb = 2.0 * (b - Math.floor(b)) - 1.0;

          return ga + u * (gb - ga);
        }
    
        function waveform(t: number): number {
          t *= 0.005
          let amp = 0;
          let amplitude = 0.5;
          let frequency = 1;
          const octaves = 4;
          for (let i = 0; i < octaves; i++) {
            amp += amplitude * pnoise(t * frequency);
            frequency *= 2;
            amplitude *= 0.5;
          }
          return amp;
        }
        
        function animate(time: number) {
          const amp = waveform(time);
          const scale = 1 + amp * 0.25;
          el!.style.transform = `scale(${scale})`;
          requestAnimationFrame(animate);
        }
        
        requestAnimationFrame(animate);
    },
})
const Hero = () => div({
    class: "-z-10 relative w-screen h-screen overflow-clip",
},
    div({
        class: "fade-edges absolute h-full w-full",
    },
        div({
            class: "grid-lines-mask cursor-none inset-0 pointer-events-none w-screen h-screen absolute bg-[#ffffff11]",
        },
            div({
                id: "cursor-background",
                class: "w-20 h-20 blur-[50px] rounded-full bg-white -z-10 bg-white absolute -translate-x-1/2 -translate-y-1/2 "
            },
            ),
        ),
    
    ),
    
    div({
        class: "z-20 flex justify-center p-20",
    },
        div({
            class: "max-w-[900px] w-full",
        },
            h1({
                class: "tracking-widest text-5xl font-bold w-max relative",
            },
                p({
                    class: "text-transparent bg-clip-text bg-gradient-to-r from-text to-primary ",
                },
                    "KODERUM"
                ),
                    
                div({
                    class: "w-full -z-10 bg-accent blur-[100px] h-4 absolute top-1/2 -translate-y-1/2",
                }),
            ),
            
        ),
    ),
    
    div({
        class: "w-12 h-full absolute top-0 right-0 right-24 bg-primary holo-bar"
    },
        div({
            class: "absolute h-full w-full bg-white -z-10 blur-[150px]",
            id: "holo-bar-flash"
        }),
    )
);

export const page = body ({
    class: "bg-background text-text font-inter relative top-0 h-screen w-screen",
},
    Hero(),

    CursorOverlay(),
 
);

export const metadata = () => head ({},
    link ({
        rel: "stylesheet",
        href: "/index.css",
    }),
    
    title ({},
        "Elegance.JS"
    ),
)

