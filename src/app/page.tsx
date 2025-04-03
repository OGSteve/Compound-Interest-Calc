import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <>
      <Calculator />
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <p>
          For any insights or feedback, please{" "}
          <a href="mailto:aididitbetter@gmail.com" style={{ color: "#0070f3", textDecoration: "none" }}>
            email me
          </a>{" "}
          or check out our{" "}
          <a href="https://github.com/OGSteve/Compound-Interest-Cal" target="_blank" rel="noopener noreferrer" style={{ color: "#0070f3", textDecoration: "none" }}>
            GitHub repository
          </a>.
        </p>
      </div>
    </>
  );
}
