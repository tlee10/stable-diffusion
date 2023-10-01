import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Box,
  ImageList,
  ImageListItem
} from "@mui/material";
import axios from "axios";
import JSZip from "jszip";



const App = () => {
  const [image, setImage] = useState();
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (prompt, negPrompt) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/?prompt=${prompt}&negPrompt=${negPrompt}&numPrompt=${4}`); 
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Read the response as an array buffer
      const zipBuffer = await response.arrayBuffer();

      const zip = new JSZip();
      await zip.loadAsync(zipBuffer);

      // Initialize an array to store base64 encoded image data
      const newImageData = [];

      // Iterate over the files in the zip archive
      for (const filename in zip.files) {

        const file = zip.files[filename];

        // Read each file as an array buffer
        const fileData = await file.async("arraybuffer");

        // Convert the array buffer to a base64 encoded string
        const base64Data = btoa(
          new Uint8Array(fileData).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        newImageData.push(base64Data);
      }
      
      setImage(newImageData);
      console.log(newImageData)

    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md">
        <Typography variant="h4" gutterBottom mt={5}>
          Stable Diffusion 🤖
        </Typography>

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
          // <div>
          //   <img
          //     src={`data:image/png;base64,${image}`}
          //     alt="Generated Image"
          //     style={{ marginTop: "20px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}
          //     width="100%"
          //   />
          // </div>
          <ImageList cols={2}>
            {image.map((data, index) => (
              <ImageListItem key={index}>
                <img                  
                  src={`data:image/png;base64,${data}`}
                  alt={`Generated image ${index}`}
                />
              </ImageListItem>
            ))}
          </ImageList>
          
        ) : null}
    </Container>
  );
};

export default App;
