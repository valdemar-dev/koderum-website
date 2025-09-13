
import { createEventListener, createState, SetEvent } from "elegance-js/server/createState";
import { createLoadHook } from "elegance-js/server/loadHook";
import { observe } from "elegance-js/server/observe";
import { CursorOverlay } from "./components/CursorOverlay";

createLoadHook({
    deps: [],
    fn: (_) => {
        const els = Array.from(document.querySelectorAll("[id=\"holo-bar-flash\"]"));
        if (els.length === 0) return;

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
            
            for (const el of els) {
                (el as HTMLElement).style.transform = `scale(${scale})`;
            }
            
            requestAnimationFrame(animate);
        }
        
        requestAnimationFrame(animate);
    },
})

createLoadHook({
    deps: [],
    fn: (_) => {
        const elements = Array.from(document.querySelectorAll('.mouse-offset')) as HTMLDivElement[];
        if (elements.length === 0) return;

        const sensitivity = 10;
        const maxOffset = 10;
        const minOffset = -10;

        function handleMouseMove(e: MouseEvent) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            elements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = mouseX - centerX;
                const dy = mouseY - centerY;
                const dist = Math.hypot(dx, dy);

                if (dist === 0) {
                    el.style.transform = '';
                    return;
                }

                const amount = Math.max(minOffset, Math.min(maxOffset, dist / sensitivity));
                const offsetX = - (dx / dist) * amount;
                const offsetY = - (dy / dist) * amount;

                el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                el.style.filter = "blur(3px)";
            });
        }

        function handleMouseLeave() {
            elements.forEach((el) => {
                el.style.transform = '';
            });
        }

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    },
})

createLoadHook({
    deps: [],
    fn: (_) => {
        const canvas = document.getElementById("star-canvas") as HTMLDivElement;
        if (canvas == null) return;

        interface Star {
            elem: HTMLImageElement;
            startTime: number;
            duration: number;
            baseScale: number;
            rotation: number;
        }

        const stars: Star[] = [];
        let nextSpawnTime = performance.now() + getRandomInterval();

        function getRandomInterval(): number {
            return 200 + Math.random() * 100; // ms between spawns
        }

        function getRandomDuration(): number {
            return 1000 + Math.random() * 300; // lifetime
        }

        function getRandomBaseScale(): number {
            return 0.5 + Math.random() * 1.5;
        }

        function getRandomRotation(): number {
            return Math.random() * 360;
        }

        function spawn(currentTime: number) {
            const starElem = document.createElement("img");
            
            starElem.src = "/icons/star.svg";
            
            Object.assign(starElem.style, {
                width: "8px",
                height: "8px",
                top: `${Math.random() * canvas.clientHeight}px`,
                left: `${Math.random() * canvas.clientWidth}px`,
                transformOrigin: "center",
                position: "absolute",
                filter: "invert(100%)",
                opacity: ".5",
            })
            
            canvas.appendChild(starElem);

            const star: Star = {
                elem: starElem,
                startTime: currentTime,
                duration: getRandomDuration(),
                baseScale: getRandomBaseScale(),
                rotation: getRandomRotation(),
            };

            stars.push(star);
        }

        function animate(time: number) {
            if (time > nextSpawnTime) {
                spawn(time);
                nextSpawnTime = time + getRandomInterval();
            }

            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];
                const progress = (time - star.startTime) / star.duration;
                if (progress > 1) {
                    canvas.removeChild(star.elem);
                    stars.splice(i, 1);
                    continue;
                }

                const opacity = Math.sin(progress * Math.PI);
                const scaleFactor = 0.5 + Math.sin(progress * Math.PI); // from 0.5 to 1.5 to 0.5
                const scale = star.baseScale * scaleFactor;

                star.elem.style.opacity = `${opacity}`;
                star.elem.style.transform = `scale(${scale}) rotate(${star.rotation}deg)`;
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    },
})

const Hero = () => div({
    class: "bg-gradient-to-br from-background via-background to-black -z-10 relative w-screen h-screen overflow-visible pointer-events-auto",
},
    div({
        "aria-hidden": "true",
        class: "absolute inset-0 -z-10",
        id: "star-canvas",
    },
    ),
    
    div({
        "aria-hidden": "true",
        class: "fade-edges absolute h-full w-full pointer-events-none -z-10",
    },
        div({
            class: "grid-lines-mask cursor-none inset-0 w-screen h-screen absolute bg-[#ffffff11]",
        },
            div({
                id: "cursor-background",
                class: "w-20 h-20 blur-[50px] rounded-full bg-white -z-10 bg-white absolute -translate-x-1/2 -translate-y-1/2 "
            }),
        ),
    ),
    
    div({
        class: "z-20 flex justify-center items-center h-full",
    },
        div({
            class: "max-w-[1200px] w-full",
        },
            h1({
                class: "tracking-widest text-5xl font-bold w-max relative ml-12",
            },
                div({
                    class: "relative group",
                },
                    span({
                        class: "text-transparent bg-clip-text bg-gradient-to-r from-text to-primary ",
                    },
                        "KODERUM"
                    ),
                    
                    span({
                        "aria-hidden": "true",
                        class: "text-[#ffffff33] absolute -z-10 top-0 left-0 select-none pointer-events-none mouse-offset",
                    },
                        "KODERUM"
                    ),
                ),
                    
                div({
                    class: "w-full -z-10 bg-accent blur-[100px] h-4 absolute top-1/2 -translate-y-1/2",
                }),
            ),
            
            div({
                class: "mt-20 text-lg/8 font-semibold max-w-[500px] relative",
            },
                span(
                "A keyboard-based text-editor that's lightning fast,",
                " with full LSP support, Tree-Sitter integration,",
                " and <i>sensible</i> keybinds.</p>"),
                
                span({ 
                    "aria-hidden": "true",
                    class: "text-[#ffffff33] absolute top-0 left-0 mouse-offset pointer-events-none select-none",
                },
                    "A keyboard-based text-editor that's lightning fast,",
                    " with full LSP support, Tree-Sitter integration,",
                    " and <i>sensible</i> keybinds.</p>"
                ),

            ),
            
            div({
                class: "mt-20 flex gap-8 select-none",
            },
                div({
                    class: "relative w-max h-max overflow-clip group",
                },
                    button({
                        class: "backdrop-blur-md text-2xl pl-10 px-6 py-4 font-semibold tracking-widest relative flex w-max border-[1px] border-text",
                        onClick: createEventListener({
                            eventListener: () => {
                                const el = document.getElementById("showcase")!;
                                const rect = el.getBoundingClientRect()
                                window.scrollTo({ top: rect.top + window.scrollY })
                            },
                        }),
                    },
                        div({
                            class: "z-20 relative top-0 flex items-center gap-3 ",
                        },
                            img({
                                src: "/icons/arrow_down.svg",
                                class: "invert-100",
                                height: 28,
                                width: 28,
                            }),
                            
                            "Showcase",
                        ),
                       
                         
                        div({
                            class: "absolute -z-10 left-0 top-0 h-full w-4 bg-primary group-hover:w-5 duration-200",
                        })
                    ),
                    
                    div({
                        class: "absolute -z-10 left-0 top-0 h-full w-12 bg-primary blur-[30px] group-hover:w-24 duration-200",
                    }),
                ),
                
                div({
                    class: "relative w-max h-max overflow-clip group",
                },
                    a({
                        class: "backdrop-blur-md text-2xl pl-10 px-6 py-4 font-semibold tracking-widest relative flex w-max border-[1px] border-text",
                        target: "_blank",
                        href: "https://github.com/valdemar-dev/koderum",
                    },
                        div({
                            class: "z-20 relative top-0 flex items-center gap-3 ",
                        },
                            img({
                                src: "/icons/github-mark-white.svg",
                                height: 28,
                                width: 28,
                            }),
                            
                            "GitHub",
                        ),
                       
                         
                        div({
                            class: "absolute -z-10 left-0 top-0 h-full w-4 bg-primary group-hover:w-5 duration-200",
                        })
                    ),
                    
                    div({
                        class: "absolute -z-10 left-0 top-0 h-full w-12 bg-primary blur-[30px] group-hover:w-24 duration-200",
                    }),
                ),
            ),

        ),
    ),
    
    div({
        class: "w-12 h-full absolute top-0 right-0 right-32 bg-primary holo-bar motion-reduce:overflow-hidden pointer-events-none"
    },
        div({
            class: "absolute -top-1/2 -transate-y-1/2 h-[250%] w-full bg-white -z-30 blur-[50px]",
            id: "holo-bar-flash"
        }),
    ),
);

const imageIndex = createState(0);
const maxImageIndex = createState(3);

const ShowcaseImage = (
    title: string, 
    description: string, 
    src: string,
) => {
    const id = createState(src);
    return div({
        class: "relative bg-cover h-full w-full group overflow-clip bg-gradient-to-br from-background via-background to-black",
        onMouseMove: createEventListener({
            eventListener: (params: SetEvent<MouseEvent, HTMLImageElement>, id) => {
                const target = document.getElementById(id.value) as HTMLImageElement;
                const parent = target.parentElement as HTMLDivElement;
                
                const targetRect = target.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();
                
                const diffX = targetRect.width / parentRect.width;
                const diffY = targetRect.height / parentRect.height;
                
                const x = (((params.event.clientX - parentRect.left) / parentRect.width) * 100);
                const y = (((params.event.clientY - parentRect.top) / parentRect.height) * 100);
                
                const xToMove = (x * diffX / 2);
                const yToMove = (y * diffY / 2);
                
                target.style.transitionProperty = "none";
                target.style.transform = `translateX(calc(${-xToMove}% + ${parentRect.width / 2}px)) translateY(calc(${-yToMove}% + ${parentRect.height / 2}px))`;
                
            },
            dependencies: [id],
        }), 
        onMouseLeave: createEventListener({
            eventListener: (_, id) => {
                const target = document.getElementById(id.value) as HTMLImageElement;
                
                target.style.transitionProperty = "all";
                target.style.transform = `translateX(0px) translateY(0px)`;
                
            },
            dependencies: [id],
        }), 
    },
        img({
            class: "pointer-events-none absolute left-0 top-0 w-auto h-full group-hover:scale-200 transition-[scale] duration-200 outline-2",
            src: src,
            id: id.value,
        }),

        div({
            class: "absolute inset-0 bg-gradient-to-b from-transparent to-black via-transparent flex flex-col p-8 hover:opacity-0 duration-200",
        },
            div({
                class: "mt-auto",
            },
                h4({
                    class: "text-lg font-semibold",
                },
                    title,
                ),
                
                p({
                    class: "text-base max-w-[500px] w-full",
                },
                    description,
                ),
            )
        )
    );
}

const Showcase = () => div({
    class: "h-screen w-screen relative -z-10 bg-cover bg-no-repeat pointer-events-auto flex flex-col gap-4 justify-center items-center",
    style: "background-image: url('/images/showcase-background.png');",
    id: "showcase",
},
    div({
        class: "z-20 h-12 w-full -translate-y-1/2 absolute top-0 left-0 bg-primary holo-bar-sideways overflow-visible motion-reduce:overflow-hidden pointer-events-none"
    },
        div({
            class: "absolute -left-1/2 -transate-x-1/2 w-[250%] h-full bg-white -z-10 blur-[50px]",
            id: "holo-bar-flash"
        }),
    ),
    
    
    div({
        class: "aspect-video h-[70%] relative z-30",
    },
        div({
            class: "absolute inset-[100px] -z-10 bg-primary blur-[150px] showcase-bg-anim",
        }),
    
        div({
            class: "absolute inset-0 z-10 bg-black border-2 overflow-clip",
            id: "carousel",
        },
            div({
                class: "absolute left-0 top-0 bottom-0 right-0 duration-200",
                style: observe([imageIndex], (i) => {
                    return `transform: translateX(calc((${i} * 100%) * -1));`;
                }),
            },
                div({
                    class: `absolute left-0 top-0 w-[calc(100%_*_${maxImageIndex.value+1})] h-full grid grid-cols-${maxImageIndex.value+1}`,
                },
                    ShowcaseImage(
                        "File Browser",
                        "The Koderum file browser, lets you easily browse, create, delete & rename files and directories.",
                        "/images/showcase/file_browser.png"
                    ),
                    ShowcaseImage(
                        "Language Support",
                        "Koderum let's you easily add support for any programming language via a simple JSON & SCM file.",
                        "/images/showcase/easy_language_support.png"
                    ),
                    ShowcaseImage(
                        "Fuzzy File Finding",
                        "Utilizing grep, you can easily go to a line of code based on it's content.",
                        "/images/showcase/fuzzy_file_finding.png"
                    ),
                    ShowcaseImage(
                        "LSP Support",
                        "Koderum fully supports the Language Server Protocol. Giving you access to things like go-to-definition, rich colours for variables, autocomplete, and more.",
                        "/images/showcase/lsp_support.png"
                    ),
                ),
            ),
        ),
    ),
    
    div({
        class: "flex gap-4 z-40 pointer-events-auto relative",
    },
        div({
            class: "relative w-max h-max overflow-clip group hover:scale-110 duration-100",
        },
            button({
                class: "backdrop-blur-md bg-background text-lg duration-200 pr-7 px-6 py-4 font-semibold tracking-widest relative flex w-max border-[1px] border-text",
                onClick: createEventListener({
                    eventListener: (_, index, max) => {
                        index.value -= 1;
                        
                        if (index.value < 0) {
                            index.value = max.value;
                        }
                        
                        index.signal();
                    },
                    dependencies: [imageIndex, maxImageIndex],
                }),
            },
                div({
                    class: "z-20 relative top-0 flex items-center gap-3 ",
                },
                    "Prev",
                    
                    img({
                        src: "/icons/arrow_down.svg",
                        class: "invert-100 -rotate-270",
                        height: 28,
                        width: 28,
                    }),
                    
                ),
            ),
        
        ),
        div({
            class: "relative w-max h-max overflow-clip group hover:scale-110 duration-100",
        },
            button({
                class: "backdrop-blur-md bg-background text-lg duration-200 pl-7 px-6 py-4 font-semibold tracking-widest relative flex w-max border-[1px] border-text",
                onClick: createEventListener({
                    eventListener: (_, index, max) => {
                        index.value += 1;
                        
                        if (index.value > max.value) {
                            index.value = 0;
                        }
                        
                        index.signal();
                    },
                    dependencies: [imageIndex, maxImageIndex],
                }),
            },
                div({
                    class: "z-20 relative top-0 flex items-center gap-3 ",
                },
                    img({
                        src: "/icons/arrow_down.svg",
                        class: "invert-100 -rotate-90",
                        height: 28,
                        width: 28,
                    }),
                    
                    "Next",
                ),
            ),
        ),
    ),
);

export const page = body ({
    class: "text-text font-inter relative top-0 w-screen pointer-events-none h-[200vh]",
},
    div({
        class: "flex flex-col h-full overflow-hidden",
    },
        CursorOverlay(),
        
        Hero(),
        
        Showcase(),
        
        footer({
            class: "flex flex-col gap-1 items-end absolute bottom-4 left-0 right-0 pr-4 opacity-50 pointer-events-auto",
        },
            a({ 
                class: "text-sm border-b-[1px] border-text",
                href: "https://val.sh",
                target: "_blank",
            },
                "Site by Valdemar"
            ),
            
            span({ 
                class: "text-sm",
            },
                "All Rights Reserved © 2025."
            ),
        )
    )
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

