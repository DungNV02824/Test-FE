import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Spin,
  message,
  Tag,
  Input,
  Checkbox,
  Modal,
} from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { debounce } from "lodash";
import "./SidePanel.css";
import { useMemo } from "react";
import { ImageAPI } from "../api/imageAPI";

interface ImageData {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  format: string;
  type?: string;
  isBackground?: boolean;
  isObject?: boolean;
  uploading?: boolean;
}

const SidePanel: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState<ImageData[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  // Listen for messages from content script and request cached images on mount
  useEffect(() => {
    const handleMessage = (
      msg: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      if (msg.type === "UPDATE_IMAGES") {
        // Classify images
        const classified = msg.data.map((img: ImageData) => ({
          ...img,
          isBackground: img.id.startsWith("bg-"),
          isObject: img.id.startsWith("img-") || img.id.startsWith("pic-"),
        }));
        setImages(classified);
        setRowData(classified);
        message.success(`Tìm thấy ${classified.length} ảnh`);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Request cached images from background script on side panel mount
    const requestCachedImages = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab.id === undefined) return;

        chrome.runtime.sendMessage(
          { type: "GET_IMAGES", tabId: tab.id },
          (response) => {
            if (response?.images && response.images.length > 0) {
              const classified = response.images.map((img: ImageData) => ({
                ...img,
                isBackground: img.id.startsWith("bg-"),
                isObject:
                  img.id.startsWith("img-") || img.id.startsWith("pic-"),
              }));
              setImages(classified);
              setRowData(classified);
              console.log(
                `[SidePanel] Loaded ${classified.length} cached images`,
              );
            }
          },
        );
      } catch (error) {
        console.error("[SidePanel] Error requesting cached images:", error);
      }
    };

    requestCachedImages();

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleRescan = async () => {
    setLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.id === undefined) return;

      const response = await chrome.tabs
        .sendMessage(tab.id, {
          type: "RESCAN",
        })
        .catch((err) => {
          console.error("SendMessage error:", err);
          return null;
        });

      if (!response?.images) {
        message.warning("Trang này không hỗ trợ quét ảnh");
        return;
      }

      if (response.images) {
        const classified = response.images.map((img: ImageData) => ({
          ...img,
          isBackground: img.id.startsWith("bg-"),
          isObject: img.id.startsWith("img-") || img.id.startsWith("pic-"),
        }));
        setImages(classified);
        setRowData(classified);
        message.success(`Tìm thấy ${classified.length} ảnh`);
      }
    } catch (error) {
      message.error("Không thể quét ảnh từ trang này");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchText(value);

        if (!value) {
          setRowData(images ?? []);
          return;
        }

        const keyword = value.toLowerCase();

        const filtered = (images ?? []).filter(
          (img) =>
            img.alt?.toLowerCase().includes(keyword) ||
            img.src?.toLowerCase().includes(keyword) ||
            img.format?.toLowerCase().includes(keyword),
        );

        setRowData(filtered);
      }, 300),
    [images],
  );

  const handleClearAll = () => {
    setImages([]);
    setRowData([]);
    setSelectedRows(new Set());
    message.success("Đã xóa danh sách");
  };

  const handleCheckbox = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(rowData.map((img) => img.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleUploadSelected = async () => {
    if (selectedRows.size === 0) {
      message.warning("Vui lòng chọn ảnh để tải lên");
      return;
    }

    setUploading(true);
    let uploadedCount = 0;
    let failedCount = 0;

    for (const imageId of selectedRows) {
      const image = images.find((img) => img.id === imageId);
      if (!image) continue;

      try {
        // Mark as uploading
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, uploading: true } : img,
          ),
        );

        // Convert image to base64
        const response = await fetch(image.src);
        const blob = await response.blob();
        const reader = new FileReader();

        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              const base64Data = base64.split(",")[1];

              // Upload to backend
              await ImageAPI.uploadImage(
                image.id,
                base64Data,
                image.src,
                blob.type || "image/jpeg",
              );

              uploadedCount++;
              message.success(`Tải lên thành công: ${image.id}`);
              resolve();
            } catch (error) {
              console.error(`Failed to upload ${imageId}:`, error);
              failedCount++;
              message.error(`Tải lên thất bại: ${image.id}`);
              resolve();
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        // Remove uploading flag
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, uploading: false } : img,
          ),
        );
      } catch (error) {
        console.error(`Error uploading ${imageId}:`, error);
        failedCount++;
        message.error(
          `Lỗi: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, uploading: false } : img,
          ),
        );
      }
    }

    setUploading(false);
    setSelectedRows(new Set());
    message.info(
      `Hoàn tất: ${uploadedCount} thành công, ${failedCount} thất bại`,
    );
  };

  const handleUploadToWordPress = async () => {
    if (selectedRows.size === 0) {
      message.warning("Vui lòng chọn ảnh để đẩy lên WordPress");
      return;
    }

    Modal.confirm({
      title: "Xác nhận đẩy lên WordPress",
      content: `Bạn muốn đẩy ${selectedRows.size} ảnh lên WordPress Media?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        setUploading(true);
        let successCount = 0;
        let failedCount = 0;

        for (const imageId of selectedRows) {
          try {
            const imageIdNum = parseInt(imageId.replace(/^\D+/, ""));
            await ImageAPI.uploadToWordPress(imageIdNum);
            successCount++;
            message.success(`WordPress upload: ${imageId}`);
          } catch (error) {
            console.error(`Failed to upload to WordPress ${imageId}:`, error);
            failedCount++;
            message.error(
              `WordPress upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }

        setUploading(false);
        setSelectedRows(new Set());
        message.info(
          `Hoàn tất: ${successCount} thành công, ${failedCount} thất bại`,
        );
      },
    });
  };

  // Custom cell renderers
  const IDRenderer = (props: any) => {
    const image = props.data as ImageData;
    return (
      <Checkbox
        checked={selectedRows.has(image.id)}
        onChange={(e) => handleCheckbox(image.id, e.target.checked)}
      />
    );
  };

  const ImageRenderer = (props: any) => {
    const image = props.data as ImageData;
    return (
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            overflow: "hidden",
            flexShrink: 0,
            border: "1px solid #d9d9d9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={image.src}
            alt={image.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              cursor: "pointer",
            }}
            title={image.alt}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: "4px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#8c8c8c",
              fontFamily: "monospace",
              marginBottom: "4px",
              wordBreak: "break-all",
              maxHeight: "32px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
            title={image.src}
          >
            {image.src}
          </div>
          <div style={{ fontSize: "12px", color: "#595959", fontWeight: 500 }}>
            {image.width} × {image.height}
          </div>
        </div>
      </div>
    );
  };

  const ActionRenderer = (props: any) => {
    const image = props.data as ImageData;
    return (
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {image.isBackground && (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            style={{ marginRight: 0 }}
          >
            Background
          </Tag>
        )}
        {image.isObject && (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            style={{ marginRight: 0 }}
          >
            Object
          </Tag>
        )}
      </div>
    );
  };

  const columns: ColDef<ImageData>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
      cellRenderer: IDRenderer,
      sortable: false,
      filter: false,
      pinned: "left",
    },
    {
      field: "src",
      headerName: "Hình ảnh",
      flex: 2,
      minWidth: 350,
      cellRenderer: ImageRenderer,
      sortable: false,
      filter: false,
    },
    {
      field: "format",
      headerName: "Thao tác",
      width: 200,
      cellRenderer: ActionRenderer,
      sortable: false,
      filter: false,
    },
  ];

  return (
    <div className="side-panel">
      <div className="header">
        <h2>Quét Ảnh</h2>
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRescan}
            loading={loading}
            size="small"
          >
            Quét lại
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
            disabled={images.length === 0}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      </div>

      <div className="search-box">
        <Input.Search
          placeholder="Tìm kiếm ảnh..."
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          size="small"
        />
      </div>

      <div className="stats">
        <span>
          Tìm thấy: <strong>{images.length}</strong> ảnh
          {searchText && ` (${rowData.length} kết quả)`}
        </span>
        {selectedRows.size > 0 && (
          <span style={{ marginLeft: "12px" }}>
            Chọn: <strong>{selectedRows.size}</strong>
          </span>
        )}
      </div>

      <div
        style={{
          padding: "12px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={handleUploadSelected}
          disabled={selectedRows.size === 0}
          loading={uploading}
          size="small"
        >
          Tải lên BE
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: "#1890ff" }}
          icon={<CloudUploadOutlined />}
          onClick={handleUploadToWordPress}
          disabled={selectedRows.size === 0}
          loading={uploading}
          size="small"
        >
          Tải lên WordPress
        </Button>
      </div>

      {loading ? (
        <div className="loading">
          <Spin />
        </div>
      ) : (
        <div className="grid-wrapper">
          <AgGridReact
            rowData={rowData}
            columnDefs={columns}
            defaultColDef={{
              resizable: true,
              sortable: false,
              filter: false,
            }}
            className="ag-theme-quartz"
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      )}
    </div>
  );
};

export default SidePanel;
