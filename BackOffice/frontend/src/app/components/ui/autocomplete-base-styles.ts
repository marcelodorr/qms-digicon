export const autocompleteBaseStyles = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: "2.5rem",
    padding: 0,
    fontSize: "0.875rem",
    backgroundColor: "#F3F7FC",
    borderRadius: "0.75rem",
    color: "rgb(71 85 105)",
    boxShadow: "none",
    border: "none",
    transition: "box-shadow 150ms ease, background-color 150ms ease",
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&.Mui-focused": {
      boxShadow: "0 0 0 2px rgba(239,68,68,0.35)",
      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    },
  },
};
