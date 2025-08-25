import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

type PieSlice = {
    name: string;
    y: number;
    color?: string;
};

type PieChartProps = {
    title: string;
    units: string;
    data: PieSlice[];
    height?: number;
    showPercentage?: boolean;
    innerSize?: string;
    showLegend?: boolean;
    showDataLabels?: boolean;
    allowPointSelect?: boolean;
};

const PieChart = ({
    title = 'Pie Chart',
    data,
    units,
    height = 300,
    showPercentage = true,
    innerSize = '0%',
    showLegend = true,
    showDataLabels = true,
    allowPointSelect = true
}: PieChartProps) => {
    
    const pieOptions = {
        chart: {
            type: 'pie',
            height: height,
            backgroundColor: 'transparent'
        },
        title: {
            text: title,
            style: {
                fontSize: '18px',
                fontWeight: 'bold'
            }
        },
        tooltip: {
            pointFormat: showPercentage 
                ? '<b>{point.percentage:.1f}%</b><br/>Value: {point.y} ' + units
                : 'Value: <b>{point.y} ' + units + '</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: allowPointSelect,
                cursor: allowPointSelect ? 'pointer' : 'default',
                dataLabels: {
                    enabled: showDataLabels,
                    format: showPercentage 
                        ? '<b>{point.name}</b>: {point.percentage:.1f}%' 
                        : '<b>{point.name}</b>: {point.y} ' + units,
                    style: {
                        fontSize: '12px'
                    }
                },
                showInLegend: showLegend,
                innerSize: innerSize,
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        },
        legend: {
            enabled: showLegend,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
        },
        series: [{
            name: 'Data',
            colorByPoint: true,
            data: data.map(item => ({
                name: item.name,
                y: item.y,
                color: item.color
            }))
        }]
    };

    return (
        <div className="p-6 rounded-lg shadow-lg h-full w-full bg-white" style={{ height: `${height + 50}px` }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={pieOptions}
                containerProps={{ style: { width: '100%', height: '100%' } }}
            />
        </div>
    );
};

export default PieChart;