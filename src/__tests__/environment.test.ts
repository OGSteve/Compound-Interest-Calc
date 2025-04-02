describe("Testing environment", () => {
  it("runs tests properly", () => {
    expect(1 + 1).toBe(2);
  });

  it("has access to DOM testing utilities", () => {
    const element = document.createElement("div");
    element.innerHTML = "Test content";
    document.body.appendChild(element);

    expect(document.body).toContainElement(element);
    expect(element).toHaveTextContent("Test content");
  });
});
