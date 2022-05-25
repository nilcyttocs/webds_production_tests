import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";

import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";

import Typography from "@mui/material/Typography";

import { styled } from "@mui/material/styles";

import { requestAPI } from "./handler";

import { Color, Page } from "./widget_container";

type powerOptions = {
  [key: string]: string;
};

export const Config = (props: any): JSX.Element => {
  const [voltages, setVoltages] = useState<powerOptions>({
    VDDL: "1800",
    VDDH: "3300",
    VDD12: "1200",
    VBUS: "1800"
  });
  const [image, setImage] = useState("");
  const [imgErr, setImgErr] = useState(false);
  const [doReflash, setDoReflash] = useState(false);

  const Input = styled("input")({
    display: "none"
  });

  const handleInputChange = (item: string, value: string) => {
    if (value !== "" && isNaN(Number(value))) {
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 4000) {
      const newVoltages: powerOptions = Object.assign({}, voltages);
      if (value === "" || value === "00") {
        value = "0";
      } else if (value !== "0") {
        value = value.replace(/^0+/, "");
      }
      newVoltages[item] = value;
      setVoltages(newVoltages);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("location", "/tmp");
    try {
      await requestAPI<any>("filesystem", {
        body: formData,
        method: "POST"
      });
    } catch (error) {
      console.error(`Error - POST /webds/filesystem\n${error}`);
    }
  };

  const handleSelectedFile = (event: any) => {
    setImage(event.target.files[0].name);
    uploadImage(event.target.files[0]);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDoReflash(event.target.checked);
  };

  const handleDoneButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    props.testRepo.settings.reflash = {};
    props.testRepo.settings.reflash["enable"] = doReflash;
    if (doReflash) {
      props.testRepo.settings.reflash["file"] = image;
    }

    if (
      props.testRepo.settings.voltages &&
      "vdd" in props.testRepo.settings.voltages
    ) {
      props.testRepo.settings.voltages["vdd"] = voltages["VDDL"];
      props.testRepo.settings.voltages["vled"] = voltages["VDDH"];
      props.testRepo.settings.voltages["vddtx"] = voltages["VDD12"];
      props.testRepo.settings.voltages["vpu"] = voltages["VBUS"];
    }

    props.commitCustomTestSettings(props.testRepo);

    props.changePage(Page.Landing);
  };

  useEffect(() => {
    if (doReflash) {
      setImgErr(image === undefined || image === "" ? true : false);
    } else {
      setImgErr(false);
    }
  }, [doReflash, image]);

  useEffect(() => {
    if (!props.testRepo.settings.reflash) {
      return;
    }
    setDoReflash(props.testRepo.settings.reflash["enable"]);
    setImage(props.testRepo.settings.reflash["file"]);
  }, [props.testRepo]);

  useEffect(() => {
    if (!props.testRepo.settings.voltages) {
      return;
    }
    const vSettings = props.testRepo.settings.voltages;
    if ("vdd" in vSettings) {
      let v: powerOptions = {};
      v["VDDL"] = vSettings["vdd"];
      v["VDDH"] = vSettings["vled"];
      v["VDD12"] = vSettings["vddtx"];
      v["VBUS"] = vSettings["vpu"];
      setVoltages(v);
    }
  }, [props.testRepo]);

  return (
    <>
      <Box sx={{ width: props.width + "px" }}>
        <Typography variant="h5" sx={{ height: "50px", textAlign: "center" }}>
          {props.partNumber} Production Tests
        </Typography>
        <Box sx={{ height: "25px" }}>
          <Typography sx={{ textAlign: "center" }}>
            Edit Test Configuration
          </Typography>
        </Box>
        <Box
          sx={{
            height: props.height + "px",
            boxSizing: "border-box",
            border: 1,
            borderRadius: 1,
            borderColor: Color.grey,
            padding: "8px",
            overflow: "auto"
          }}
        >
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ width: "25%", flexShrink: 0 }}>
                Voltages
              </Typography>
              <Typography sx={{ paddingLeft: "4px", color: "text.secondary" }}>
                {JSON.stringify(voltages)
                  .replace(/:/g, ": ")
                  .replace(/"|{|}/g, "")
                  .replace(/,/g, ", ")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack justifyContent="center" spacing={2} direction="row">
                {["VDDL", "VDDH", "VDD12", "VBUS"].map((voltage) => (
                  <FormControl
                    key={voltage}
                    variant="outlined"
                    sx={{ width: "25%" }}
                  >
                    <InputLabel htmlFor="voltage-input">{voltage}</InputLabel>
                    <OutlinedInput
                      id="voltage-input"
                      label={voltage}
                      value={voltages[voltage]}
                      onChange={(event) =>
                        handleInputChange(voltage, event.target.value)
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <Typography>mv</Typography>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ width: "25%", flexShrink: 0 }}>
                Reflash
              </Typography>
              <Typography sx={{ paddingLeft: "4px", color: "text.secondary" }}>
                {doReflash ? "Enabled" : "Disabled"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2} direction="column">
                <Switch onChange={handleSwitchChange} checked={doReflash} />
                {doReflash && (
                  <>
                    <label htmlFor="button-reflash-image">
                      <Input
                        id="button-reflash-image"
                        type="file"
                        accept=".img"
                        onChange={(event) => handleSelectedFile(event)}
                      />
                      <Button
                        component="span"
                        sx={{ width: "100px", marginRight: "25px" }}
                      >
                        Image
                      </Button>
                      <TextField
                        id="file-reflash-image"
                        defaultValue=""
                        value={image}
                        error={imgErr}
                        InputProps={{ readOnly: true }}
                        variant="standard"
                        onChange={(event) => setImage(event.target.value)}
                        sx={{ width: "500px" }}
                      />
                    </label>
                  </>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Button
            disabled={imgErr}
            onClick={(event) => handleDoneButtonClick(event)}
            sx={{ width: "100px" }}
          >
            Done
          </Button>
        </div>
      </Box>
    </>
  );
};
