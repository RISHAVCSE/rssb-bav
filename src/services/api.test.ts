import fs from "fs";
import path from "path";

describe("API configuration", () => {
  it("does not contain hardcoded localhost backend URLs in source files", () => {
    const filesToCheck = [
      "src/AllocationApproval/AllocationApproval.tsx",
      "src/CentreList/index.tsx",
      "src/ReceiptHistoryTable/ReceiptHistoryTable.tsx",
      "src/services/allotedBookService.ts",
      "src/services/booksService.ts",
      "src/services/centreService.ts",
      "src/services/userService.ts",
    ];

    const combinedSource = filesToCheck
      .map((file) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8"))
      .join("\n");

    expect(combinedSource).not.toMatch(/161\.118\.167\.160:30919|localhost:8080|http:\/\/localhost:8080|https?:\/\/localhost/);
  });
});
