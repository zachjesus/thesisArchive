import { createSignal } from "solid-js";

export default function SideBar() {
    const [open, setOpen] = createSignal(true);

    return (
        <div id="sidebar">
            <h1>
                OPEN <br />
                ARCHIVE  <br />
                <hr
                    style={{
                    width: "12rem",
                    }}
                />
            </h1>

            <button
                id="sidebar-btn"
                aria-label="Toggle menu"
                onClick={() => setOpen(o => !o)}
            >
                <span
                    id="plus"
                    style={{
                        display: "inline-block",
                        transform: open() ? "rotate(180deg)" : "rotate(0)"
                    }}
                >
                    {open() ? "+" : "≡"}
                    
                </span>
                
            </button>

            <ul
                id="sidebar-links"
                style={{
                    display: open() ? "block" : "none"
                }}
            >
                <li><a href="/">HOME</a></li>
                <li><a href="/collections">COLLECTIONS</a></li>
                <li><a href="/voting">VOTING</a></li>
                <li><a href="/about">ABOUT</a></li>
            </ul>
        </div>
    );
}