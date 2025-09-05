import { createEventListener, createState } from "elegance-js/server/createState";
import { createLoadHook } from "elegance-js/server/loadHook";
import { observe } from "elegance-js/server/observe";

createLoadHook({
    fn: (_) => {
        const el = document.getElementById("cursor");
        const elTwo = document.getElementById("cursor-background");
        
        if (!el || !elTwo) return;
        
        const eventListener = (event: MouseEvent) => {
            el.style.left = event.clientX + "px"
            el.style.top = event.clientY + "px"
            elTwo.style.left = event.clientX + "px"
            elTwo.style.top = event.clientY + "px"
        };
        
        document.addEventListener("mousemove", eventListener)
        
        return () => {
            document.removeEventListener("mousemove", eventListener)
        };
    },
    deps: [],
})

export const CursorOverlay = () => div({
    class: "fixed inset-0 z-10 pointer-events-none",
},
    div({
        class: "cursor-none pointer-events-none absolute inset-0 z-50",
    },
        div({
            id: "cursor",
            class: "w-4 h-4 bg-background absolute rounded-sm -translate-x-1/2 -translate-y-1/2 border-2 border-text"
        },
        ),
    ),
);