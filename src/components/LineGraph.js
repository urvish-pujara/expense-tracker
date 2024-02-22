import React from 'react';
import { Grid, Typography } from '@mui/material';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip, Legend } from 'recharts';

const LineGraph = ({ data, title, xdatakey, linedatakey, children, multipleLines }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    multipleLines = multipleLines || false;
    return (
        <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>
            {children}
            <LineChart width={500} height={300} data={data}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey={xdatakey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {multipleLines ?
                    linedatakey.map((dataKey, index) => (
                        <Line
                            key={dataKey}
                            type="monotone"
                            dataKey={dataKey}
                            stroke={COLORS[index % COLORS.length]}
                        />
                    ))
                    :
                    <Line type="monotone" dataKey={linedatakey} stroke="#8884d8" />
                }
            </LineChart>

        </Grid>
    );
}
export default LineGraph;