import React, { useEffect, useState } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  AccordionSummaryProps
} from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { requestAPI } from './local_exports';
import { Canvas } from './mui_extensions/Canvas';
import { CANVAS_ATTRS } from './mui_extensions/constants';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';
import { Page } from './ProductionTestsComponent';

type powerOptions = {
  [key: string]: string;
};

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    marginBottom: '8px'
  },
  '&:before': {
    display: 'none'
  }
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)'
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1)
  }
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)'
}));

export const Config = (props: any): JSX.Element => {
  const [voltages, setVoltages] = useState<powerOptions>({
    VDDL: '1800',
    VDDH: '3300',
    VDD12: '1200',
    VBUS: '1800'
  });
  const [image, setImage] = useState('');
  const [imgErr, setImgErr] = useState(false);
  const [doReflash, setDoReflash] = useState(false);

  const Input = styled('input')({
    display: 'none'
  });

  const handleInputChange = (item: string, value: string) => {
    if (value !== '' && isNaN(Number(value))) {
      return;
    }
    const newVoltages: powerOptions = Object.assign({}, voltages);
    if (value !== '') {
      const num = parseInt(value, 10);
      if (num > 4000) {
        return;
      }
    }
    newVoltages[item] = value;
    setVoltages(newVoltages);
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('location', '/tmp');
    try {
      await requestAPI<any>('filesystem', {
        body: formData,
        method: 'POST'
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
    props.testRepo.settings.reflash['enable'] = doReflash;
    if (doReflash) {
      props.testRepo.settings.reflash['file'] = image;
    }

    if (
      props.testRepo.settings.voltages &&
      'vdd' in props.testRepo.settings.voltages
    ) {
      props.testRepo.settings.voltages['vdd'] = voltages['VDDL'];
      props.testRepo.settings.voltages['vled'] = voltages['VDDH'];
      props.testRepo.settings.voltages['vddtx'] = voltages['VDD12'];
      props.testRepo.settings.voltages['vpu'] = voltages['VBUS'];
    }

    props.commitCustomTestSettings(props.testRepo);

    props.changePage(Page.Landing);
  };

  useEffect(() => {
    if (doReflash) {
      setImgErr(image === undefined || image === '' ? true : false);
    } else {
      setImgErr(false);
    }
  }, [doReflash, image]);

  useEffect(() => {
    if (!props.testRepo.settings.reflash) {
      return;
    }
    setDoReflash(props.testRepo.settings.reflash['enable']);
    setImage(props.testRepo.settings.reflash['file']);
  }, [props.testRepo]);

  useEffect(() => {
    if (!props.testRepo.settings.voltages) {
      return;
    }
    const vSettings = props.testRepo.settings.voltages;
    if ('vdd' in vSettings) {
      let v: powerOptions = {};
      v['VDDL'] = vSettings['vdd'];
      v['VDDH'] = vSettings['vled'];
      v['VDD12'] = vSettings['vddtx'];
      v['VBUS'] = vSettings['vpu'];
      setVoltages(v);
    }
  }, [props.testRepo]);

  return (
    <Canvas title={props.partNumber + ' Production Tests'}>
      <Content
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ margin: '0px auto' }}>
          <Typography>Edit Test Configuration</Typography>
        </div>
        <div style={{ marginTop: '24px', overflow: 'auto' }}>
          <Accordion>
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon />}>
              <Typography sx={{ width: '25%', flexShrink: 0 }}>
                Voltages
              </Typography>
              <Typography sx={{ paddingLeft: '4px', color: 'text.secondary' }}>
                {JSON.stringify(voltages)
                  .replace(/:/g, ': ')
                  .replace(/"|{|}/g, '')
                  .replace(/,/g, ', ')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack justifyContent="center" spacing={2} direction="row">
                {['VDDL', 'VDDH', 'VDD12', 'VBUS'].map(voltage => (
                  <FormControl
                    key={voltage}
                    variant="outlined"
                    sx={{ width: '25%' }}
                  >
                    <InputLabel htmlFor="webds_production_tests_config_voltage_input">
                      {voltage}
                    </InputLabel>
                    <OutlinedInput
                      id="webds_production_tests_config_voltage_input"
                      label={voltage}
                      value={voltages[voltage]}
                      onChange={event =>
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
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon />}>
              <Typography sx={{ width: '25%', flexShrink: 0 }}>
                Reflash
              </Typography>
              <Typography sx={{ paddingLeft: '4px', color: 'text.secondary' }}>
                {doReflash ? 'Enabled' : 'Disabled'}
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
                        onChange={event => handleSelectedFile(event)}
                      />
                      <Button
                        component="span"
                        sx={{ width: '100px', marginRight: '24px' }}
                      >
                        Image
                      </Button>
                      <TextField
                        variant="standard"
                        defaultValue=""
                        value={image}
                        error={imgErr}
                        InputProps={{ readOnly: true }}
                        onChange={event => setImage(event.target.value)}
                        sx={{
                          width:
                            CANVAS_ATTRS.WIDTH -
                            CANVAS_ATTRS.PADDING * 2 -
                            1 * 2 -
                            16 * 2 -
                            100 -
                            24 +
                            'px'
                        }}
                      />
                    </label>
                  </>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </div>
      </Content>
      <Controls
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Button
          disabled={Object.values(voltages).includes('') || imgErr}
          onClick={() => handleDoneButtonClick()}
          sx={{ width: '150px' }}
        >
          Done
        </Button>
      </Controls>
    </Canvas>
  );
};

export default Config;
