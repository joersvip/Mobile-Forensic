from typing import List, Dict, Any

class HexViewer:
    """
    Decodes binary records into standardized hexadecimal columns with offset counters and printable ASCII panels.
    """
    def __init__(self, bytes_per_line: int = 16):
        self.bytes_per_line = bytes_per_line

    def convert_to_hex_dump(self, data: bytes) -> List[Dict[str, Any]]:
        """
        Converts raw bytes into a list of offset-hex-ascii rows.
        """
        dump = []
        for offset in range(0, len(data), self.bytes_per_line):
            chunk = data[offset : offset + self.bytes_per_line]
            
            # Format hex representation
            hex_parts = [f"{b:02x}" for b in chunk]
            hex_str = " ".join(hex_parts)
            
            # Format ascii representation
            ascii_parts = []
            for b in chunk:
                if 32 <= b <= 126:
                    ascii_parts.append(chr(b))
                else:
                    ascii_parts.append(".")
            ascii_str = "".join(ascii_parts)
            
            dump.append({
                "offset": f"{offset:08X}",
                "hex": hex_str,
                "ascii": ascii_str,
                "bytes_count": len(chunk)
            })
            
        return dump
