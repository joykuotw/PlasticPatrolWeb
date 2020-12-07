import React from "react";
import clsx from "clsx";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import StarsIcon from "@material-ui/icons/Stars";
import {
  AutoSizer,
  Column,
  Table,
  TableCellRenderer,
  TableHeaderProps
} from "react-virtualized";

import { sortArrayByObjectKey } from "utils";

declare module "@material-ui/core/styles/withStyles" {
  // Augment the BaseCSSProperties so that we can control jss-rtl
  interface BaseCSSProperties {
    /*
     * Used to control if the rule-set should be affected by rtl transformation
     */
    flip?: boolean;
  }
}

const styles = (theme: Theme) =>
  createStyles({
    flexContainer: {
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box"
    },
    table: {
      // temporary right-to-left patch, waiting for
      // https://github.com/bvaughn/react-virtualized/issues/454
      "& .ReactVirtualized__Table__headerRow": {
        flip: false,
        paddingRight: theme.direction === "rtl" ? "0px !important" : undefined
      }
    },
    tableRow: {
      cursor: "pointer"
    },
    tableRowHover: {
      "&:hover": {
        backgroundColor: theme.palette.grey[200]
      }
    },
    tableCell: {
      flex: 1
    },
    noClick: {
      cursor: "initial"
    },
    rank: {
      padding: 0,
      justifyContent: "center"
    },
    header: {
      fontWeight: "bold",
      position: "relative",
      padding: theme.spacing(1),
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.secondary.contrastText
    },
    highlightRow: {
      fontWeight: "bold",
      color: theme.palette.primary.main
    }
  });

interface ColumnData {
  dataKey: string;
  label: string;
  numeric?: boolean;
  width: number;
}

interface Row {
  index: number;
}

interface MuiVirtualizedTableProps extends WithStyles<typeof styles> {
  columns: ColumnData[];
  headerHeight?: number;
  onRowClick?: () => void;
  rowCount: number;
  rowGetter: (row: Row) => UserLeaderboardData;
  rowHeight?: number;
  userId?: string;
}

export interface UserLeaderboardData {
  displayName: string;
  pieces: number;
  largeCollectionPieces?: number;
}

class MuiVirtualizedTable extends React.PureComponent<MuiVirtualizedTableProps> {
  static defaultProps = {
    headerHeight: 40,
    rowHeight: 48
  };

  getRowClassName = ({ index }: Row) => {
    const { classes, onRowClick } = this.props;

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    });
  };

  cellRenderer: TableCellRenderer = ({
    cellData,
    columnIndex,
    rowData: { uid, rank },
    dataKey
  }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null,
          [classes.highlightRow]: rank === 1 || uid === this.props.userId,
          [classes.rank]: dataKey === "rank"
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={
          (columnIndex != null && columns[columnIndex].numeric) || false
            ? "right"
            : "left"
        }
      >
        {dataKey === "rank" && rank === 1 ? <StarsIcon /> : cellData}
      </TableCell>
    );
  };

  headerRenderer = ({
    label,
    columnIndex
  }: TableHeaderProps & { columnIndex: number }) => {
    const { headerHeight, columns, classes } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick,
          classes.header
        )}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? "right" : "left"}
      >
        <span>{label}</span>
      </TableCell>
    );
  };

  render() {
    const {
      classes,
      columns,
      rowHeight,
      headerHeight,
      ...tableProps
    } = this.props;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            rowHeight={rowHeight!}
            gridStyle={{
              direction: "inherit"
            }}
            headerHeight={headerHeight!}
            className={classes.table}
            {...tableProps}
            rowClassName={this.getRowClassName}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

type Props = {
  usersLeaderboard: UserLeaderboardData[];
  user?: { id?: string };
  allowZeroPieces: boolean;
};

export default function UserPieceRankTable({
  user,
  usersLeaderboard,
  allowZeroPieces
}: Props) {
  const copy = usersLeaderboard
    .filter(({ pieces }) => allowZeroPieces || pieces > 0)
    .map(({ pieces, largeCollectionPieces, ...rest }) => ({
      pieces:
        pieces -
        (largeCollectionPieces === undefined ? 0 : largeCollectionPieces),
      largeCollectionPieces,
      ...rest
    }));
  sortArrayByObjectKey(copy, "pieces").reverse();
  const withRank = copy.map(({ displayName, ...value }, index) => ({
    displayName: displayName.split("@")[0],
    rank: index + 1,
    ...value
  }));
  const width = window.innerWidth;

  return (
    <VirtualizedTable
      rowCount={withRank.length}
      rowGetter={({ index }) => withRank[index]}
      userId={user && user.id}
      columns={[
        {
          width: width * 0.15,
          label: "Rank",
          dataKey: "rank"
        },
        {
          width: width * 0.55,
          label: "User",
          dataKey: "displayName",
          numeric: false
        },
        {
          width: width * 0.3,
          label: "Pieces",
          dataKey: "pieces",
          numeric: true
        }
      ]}
    />
  );
}
