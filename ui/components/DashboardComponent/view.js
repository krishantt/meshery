import React from 'react';
import { ArrowBack } from '@material-ui/icons';
import TooltipButton from '../../utils/TooltipButton';
import { Paper, IconButton } from '@material-ui/core';
import { useRouter } from 'next/router';
// import { FormatStructuredData } from '../DataFormatter';
import NameValueTable from '../DataFormatter/NameValueTable';
import ResponsiveDataTable from '../../utils/data-table';

const View = (props) => {
  const { type, setView, resource, classes } = props;
  console.log(type, setView);

  // TODO: handle the condition for images
  function RenderDynamicTable(key, value) {
    const allKeys = value.reduce((keys, obj) => {
      Object.keys(obj).forEach((key) => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
      return keys;
    }, []);

    const columns = allKeys.map((key) => ({
      name: key,
      label: key,
      options: {
        filter: false,
        sort: false,
        display: key == 'id' ? false : true,
      },
    }));

    let options = {
      filter: false,
      download: false,
      print: false,
      search: false,
      viewColumns: false,
      selectableRows: 'none',
      pagination: false,
      responsive: 'standard',
    };

    return (
      <>
        {key}

        <ResponsiveDataTable
          classes={classes.muiRow}
          data={value}
          columns={columns}
          options={options}
          tableCols={columns}
          updateCols={() => {}}
          columnVisibility={{}}
        />
      </>
    );
  }

  const RenderObject = (obj) => {
    function processObjForKeyValTable(obj) {
      const [processedData, setProcessedData] = React.useState([]);

      function processObj(obj, parentKey = '') {
        let rows = [];
        let currentGroup = [];

        for (const [key, value] of Object.entries(obj)) {
          const currentKey = parentKey ? `${parentKey}.${key}` : key;

          if (Array.isArray(value)) {
            // Skip the key if the value is an array
            continue;
          } else if (typeof value === 'object' && value !== null) {
            // For objects, recursively process and add to the current group
            currentGroup.push(...processObj(value, currentKey));
          } else {
            // For non-objects, add to the rows directly
            if (key === 'attribute') {
              currentGroup.push(...processObj(JSON.parse(value), currentKey));
            } else if (key === 'id') {
              currentGroup.push({ name: currentKey, value: value, hide: true });
            } else {
              currentGroup.push({ name: currentKey, value });
            }
          }
        }

        // Group by the parent key
        if (parentKey !== '' && currentGroup.length > 0) {
          if (Array.isArray(currentGroup)) {
            setProcessedData((prev) => [...prev, { [parentKey]: currentGroup }]);
          }
        }

        return rows;
      }

      React.useEffect(() => {
        processObj(obj);
      }, [obj]);

      return (
        <>
          {processedData.map((obj, index) => (
            <div key={index}>
              {Object.entries(obj).map(([key, value], innerIndex) => (
                <div key={innerIndex}>
                  {key}
                  <NameValueTable rows={value} />
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }

    const processObjForKeyDataTable = (obj, parentKey = '') => {
      let results = [];
      for (const [key, value] of Object.entries(obj)) {
        const currentKey = parentKey ? `${parentKey}.${key}` : key;
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === 'object' &&
          value[0] !== null
        ) {
          results.push(RenderDynamicTable(key, value));
        }
        if (typeof value === 'object' && value !== null) {
          results.push(processObjForKeyDataTable(value, currentKey));
        } else {
          if (key === 'attribute') {
            results.push(processObjForKeyDataTable(JSON.parse(value), currentKey));
          }
        }
      }
      return results;
    };

    return (
      <>
        {processObjForKeyValTable(obj)}
        {processObjForKeyDataTable(obj)}
      </>
    );
  };

  const router = useRouter();

  const HeaderComponent = () => {
    return (
      <>
        <TooltipButton title="Back" placement="left">
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
        </TooltipButton>
      </>
    );
  };

  const ResourceMetrics = () => {
    return <></>;
  };

  return (
    <>
      <div
        style={{
          margin: '1rem auto',
        }}
      >
        <Paper>
          <HeaderComponent />
          <div style={{ margin: '1rem 7rem' }}>
            <ResourceMetrics />
            <RenderObject obj={resource} />
          </div>
        </Paper>
      </div>
    </>
  );
};

export default View;
