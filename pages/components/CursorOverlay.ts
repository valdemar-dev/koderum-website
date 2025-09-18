import { createEventListener, createState } from "elegance-js/server/createState";
import { createLoadHook } from "elegance-js/server/loadHook";
import { observe } from "elegance-js/server/observe";

createLoadHook({
    fn: (_) => {
        const el = document.getElementById("cursor");
        const elTwo = document.getElementById("cursor-background");
        
        
        if (!el || !elTwo) return;
        
        if (window.matchMedia('(pointer: coarse)').matches) {
            el.style.opacity = "0";
            elTwo.style.display = "hidden";
            
            return
        }
        
        const isClickableAt = (x: number, y: number) => {
            let el = document.elementFromPoint(x, y);
            if (!el) return false;
        
            const interactiveTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
        
            while (el) {
                if (interactiveTags.includes(el.tagName)) return true;
        
                const style = window.getComputedStyle(el);
                if (style.cursor === 'pointer') return true;
        
                el = el.parentElement;
            }
        
            return false;
        };
        
        const eventListener = (event: MouseEvent) => {
            el.style.left = event.clientX + "px"
            el.style.top = event.clientY + "px"
            elTwo.style.left = event.clientX + "px"
            elTwo.style.top = event.clientY + window.scrollY + "px"
            
            if (isClickableAt(event.clientX, event.clientY) === false) {
                el.style.borderRadius = "0.25rem";
            } else {
                el.style.borderRadius = "0.5rem";
            }
        };
        
        document.addEventListener("mousemove", eventListener)
        
        return () => {
            document.removeEventListener("mousemove", eventListener)
        };
    },
    deps: [],
})

export const CursorOverlay = () => div({
    id: "cursor",
    class: "z-50 w-4 h-4 bg-background fixed rounded-sm -translate-x-1/2 -translate-y-1/2 border-2 border-text pointer-events-none transition-[border-radius] duration-200"
});