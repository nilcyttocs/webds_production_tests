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

import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

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

  useEffect(() => {
    if (!props.testRepo.settings) {
      return;
    }
    const settings = props.testRepo.settings;
    if ("vdd" in settings) {
      let v: powerOptions = {};
      v["VDDL"] = settings["vdd"];
      v["VDDH"] = settings["vled"];
      v["VDD12"] = settings["vddtx"];
      v["VBUS"] = settings["vpu"];
      setVoltages(v);
    }
  }, [props.testRepo]);

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

  const handleDoneButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (props.testRepo.settings && "vdd" in props.testRepo.settings) {
      const settings = props.testRepo.settings;
      settings["vdd"] = voltages["VDDL"];
      settings["vled"] = voltages["VDDH"];
      settings["vddtx"] = voltages["VDD12"];
      settings["vpu"] = voltages["VBUS"];
      props.commitCustomTestSettings(props.testRepo);
    }
    props.changePage(Page.Landing);
  };

  return (
    <ThemeProvider theme={props.theme}>
      <Box sx={{ width: props.width + "px" }}>
        <Typography variant="h5" sx={{ height: "50px", textAlign: "center" }}>
          {props.partNumber} Production Tests
        </Typography>
        <Box sx={{ height: "25px" }}>
          <Typography sx={{ textAlign: "center" }}>
            edit test configuration
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
              <Typography sx={{ color: "text.secondary" }}>
                {JSON.stringify(voltages)
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
            onClick={(event) => handleDoneButtonClick(event)}
            sx={{ width: "100px" }}
          >
            Done
          </Button>
        </div>
      </Box>
    </ThemeProvider>
  );
};
