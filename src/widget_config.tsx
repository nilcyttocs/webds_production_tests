import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps
} from "@mui/material/AccordionSummary";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";

import { styled } from "@mui/material/styles";

import { requestAPI } from "./handler";

import { Page } from "./widget_container";

const showHelp = false;

type powerOptions = {
  [key: string]: string;
};

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    marginBottom: "8px"
  },
  "&:before": {
    display: "none"
  }
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)"
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1)
  }
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)"
}));

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

  const handleDoneButtonClick = () => {
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
      <Stack spacing={2}>
        <Box
          sx={{
            width: props.dimensions.width + "px",
            height: props.dimensions.heightTitle + "px",
            position: "relative",
            bgcolor: "section.main"
          }}
        >
          <Typography
            variant="h5"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            {props.partNumber} Production Tests
          </Typography>
          {showHelp && (
            <Button
              variant="text"
              sx={{
                position: "absolute",
                top: "50%",
                left: "16px",
                transform: "translate(0%, -50%)"
              }}
            >
              <Typography variant="body2" sx={{ textDecoration: "underline" }}>
                Help
              </Typography>
            </Button>
          )}
        </Box>
        <Box
          sx={{
            width: props.dimensions.width + "px",
            height: props.dimensions.heightContent + "px",
            position: "relative",
            bgcolor: "section.main",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ margin: "24px auto 0px auto" }}>
            <Typography>Edit Test Configuration</Typography>
          </div>
          <div style={{ margin: "24px", overflow: "auto" }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ width: "25%", flexShrink: 0 }}>
                  Voltages
                </Typography>
                <Typography
                  sx={{ paddingLeft: "4px", color: "text.secondary" }}
                >
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
                      <InputLabel htmlFor="webds_production_tests_config_voltage_input">
                        {voltage}
                      </InputLabel>
                      <OutlinedInput
                        id="webds_production_tests_config_voltage_input"
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
                <Typography
                  sx={{ paddingLeft: "4px", color: "text.secondary" }}
                >
                  {doReflash ? "Enabled" : "Disabled"}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2} direction="column">
                  <Switch onChange={handleSwitchChange} checked={doReflash} />
                  {doReflash && (
                    <>
                      <label htmlFor="webds_production_tests_config_reflash_input">
                        <Input
                          id="webds_production_tests_config_reflash_input"
                          type="file"
                          accept=".img"
                          onChange={(event) => handleSelectedFile(event)}
                        />
                        <Button
                          component="span"
                          sx={{ width: "100px", marginRight: "24px" }}
                        >
                          Image
                        </Button>
                        <TextField
                          variant="standard"
                          defaultValue=""
                          value={image}
                          error={imgErr}
                          InputProps={{ readOnly: true }}
                          onChange={(event) => setImage(event.target.value)}
                          sx={{
                            width:
                              props.dimensions.width -
                              24 * 2 -
                              1 * 2 -
                              16 * 2 -
                              100 -
                              24 +
                              "px"
                          }}
                        />
                      </label>
                    </>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </div>
        </Box>
        <Box
          sx={{
            width: props.dimensions.width + "px",
            minHeight: props.dimensions.heightControls + "px",
            position: "relative",
            bgcolor: "section.main",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              margin: "24px"
            }}
          >
            <Button
              onClick={() => handleDoneButtonClick()}
              sx={{ width: "150px" }}
            >
              Done
            </Button>
          </div>
        </Box>
      </Stack>
    </>
  );
};
