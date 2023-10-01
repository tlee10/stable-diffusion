import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Box
} from "@mui/material";
import axios from "axios";


const App = () => {
  const [image, setImage] = useState();
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (prompt) => {
    setLoading(true);
    axios.get(`http://127.0.0.1:8000/?prompt=${prompt}&negPrompt=${negPrompt}`)
    .then(res => {
      setImage(res.data);
      console.log(res.data)
    })
    .catch(error => {
      setTimeout(2000);
      console.error("Error:", error)})
    .finally(() => setLoading(false))
  };

  return (
    <Container maxWidth="md">
        <Typography variant="h4" gutterBottom mt={5}>
          Stable Diffusion 🤖
        </Typography>
        {/* <Typography variant="body1" gutterBottom>
          This React application leverages the model trained by Stability AI and
          Runway ML to generate images using the Stable Diffusion Deep Learning
          model. The model can be found via GitHub here{" "}
          <Link href="https://github.com/CompVis/stable-diffusion">
            Github Repo
          </Link>
        </Typography> */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate(prompt, negPrompt);
          }}
        >
          <Box mb={2}>
            <TextField
              label="Enter Prompt"
              variant="outlined"
              fullWidth
              margin="dense"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <TextField
              label="Enter Negative Prompt"
              variant="outlined"
              fullWidth
              value={negPrompt}
              onChange={(e) => setNegPrompt(e.target.value)}
            />
          </Box>          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress /> : "Generate"}
          </Button>
        </form>

        {loading ? (
          <Stack sx={{ width: '100%', color: 'grey.500'}} mt={3} spacing={2}>
            <LinearProgress color="secondary" />
            <LinearProgress color="success" />
            <LinearProgress color="inherit" />
            <LinearProgress color="secondary" />
            <LinearProgress color="success" />
            <LinearProgress color="inherit" />
            <LinearProgress color="success" />
            <LinearProgress color="inherit" />
          </Stack>          
        ) : image ? (
          <div>
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated Image"
              style={{ marginTop: "20px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}
              width="100%"
            />
          </div>
          
        ) : null}
    </Container>
  );
};

export default App;
